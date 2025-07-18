"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  XCircle, 
  CheckCircle,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Local, LocalFormData } from "@/services/types/Local"
import { getLocales, postLocal, putLocal, deleteLocal } from "@/services/api/Local"

export default function LocalPage() {
  const [locales, setLocales] = useState<Local[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Local>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editModal, setEditModal] = useState({ open: false, id: 0 })
  const [deleteModal, setDeleteModal] = useState({ open: false, id: 0, name: "" })

  const pageSize = 10

  const [formData, setFormData] = useState<LocalFormData>({
    nombre: "",
    direccion: "",
    tipo: "Local",
    capacidad: 50,
    estado: true
  })

  // Cargar locales al montar el componente
  useEffect(() => {
    loadLocales()
  }, [])

  const loadLocales = async () => {
    setLoading(true)
    try {
      const data = await getLocales()
      setLocales(data)
    } catch (error) {
      console.error("Error loading locales:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar y ordenar locales
  const filtered = useMemo(() => {
    return locales.filter((l) => {
      const searchTerm = search.toLowerCase()
      return (
        l.nombre.toLowerCase().includes(searchTerm) ||
        l.direccion.toLowerCase().includes(searchTerm) ||
        l.tipo.toLowerCase().includes(searchTerm)
      )
    })
  }, [locales, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }
      
      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortDirection === "asc" ? (aValue === bValue ? 0 : aValue ? 1 : -1) : (aValue === bValue ? 0 : aValue ? -1 : 1)
      }
      
      return 0
    })
  }, [filtered, sortField, sortDirection])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page])

  const totalPages = Math.ceil(sorted.length / pageSize)

  // Funciones de manejo
  const handleSort = (field: keyof Local) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: keyof Local) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? " ↑" : " ↓"
  }

  const handleInputChange = (field: keyof LocalFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      direccion: "",
      tipo: "Local",
      capacidad: 50,
      estado: true
    })
  }

  const handleAddLocal = async () => {
    if (!formData.nombre || !formData.direccion || !formData.tipo) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    try {
      const newLocal = await postLocal(formData)
      if (newLocal) {
        setLocales(prev => [...prev, newLocal])
        setShowAdd(false)
        resetForm()
      } else {
        alert("Error al crear el local")
      }
    } catch (error) {
      console.error("Error creating local:", error)
      alert("Error al crear el local")
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (id: number) => {
    const local = locales.find(l => l.id === id)
    if (local) {
      setFormData({
        nombre: local.nombre,
        direccion: local.direccion,
        tipo: local.tipo,
        capacidad: local.capacidad,
        estado: local.estado
      })
      setEditModal({ open: true, id })
    }
  }

  const handleEditSave = async () => {
    if (!formData.nombre || !formData.direccion || !formData.tipo) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    try {
      const updatedLocal = await putLocal({
        id: editModal.id,
        ...formData
      })
      if (updatedLocal) {
        setLocales(prev => 
          prev.map(l => 
            l.id === editModal.id ? updatedLocal : l
          )
        )
        setEditModal({ open: false, id: 0 })
        resetForm()
      } else {
        alert("Error al actualizar el local")
      }
    } catch (error) {
      console.error("Error updating local:", error)
      alert("Error al actualizar el local")
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (id: number) => {
    const local = locales.find(l => l.id === id)
    if (local) {
      setDeleteModal({ 
        open: true, 
        id, 
        name: local.nombre 
      })
    }
  }

  const handleDelete = async (id: number) => {
    setLoading(true)
    try {
      const success = await deleteLocal(id)
      if (success) {
        setLocales(prev => prev.filter(l => l.id !== id))
        setDeleteModal({ open: false, id: 0, name: "" })
      } else {
        alert("Error al eliminar el local")
      }
    } catch (error) {
      console.error("Error deleting local:", error)
      alert("Error al eliminar el local")
    } finally {
      setLoading(false)
    }
  }

  const toggleLocalStatus = async (id: number) => {
    setLoading(true)
    try {
      const local = locales.find(l => l.id === id)
      if (local) {
        const updatedLocal = await putLocal({
          ...local,
          estado: !local.estado
        })
        if (updatedLocal) {
          setLocales(prev => 
            prev.map(l => 
              l.id === id ? updatedLocal : l
            )
          )
        } else {
          alert("Error al cambiar el estado del local")
        }
      }
    } catch (error) {
      console.error("Error toggling local status:", error)
      alert("Error al cambiar el estado del local")
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: boolean) => {
    return estado ? (
      <Badge variant="default" className="bg-green-500">Activo</Badge>
    ) : (
      <Badge variant="destructive">Inactivo</Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Locales</h1>
          <p className="text-muted-foreground">Gestiona las sucursales y ubicaciones del gimnasio</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <MapPin className="w-4 h-4 mr-1" />
          {filtered.length} local{filtered.length !== 1 ? "es" : ""}
        </Badge>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar local..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => resetForm()}>
                  <Plus className="w-4 h-4" />
                  Agregar Local
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Agregar local</DialogTitle>
                  <DialogDescription>Completa la información del nuevo local</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <label htmlFor="nombre" className="text-sm font-medium">Nombre</label>
                    <Input 
                      id="nombre" 
                      value={formData.nombre} 
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      placeholder="Gym Central"
                    />
                  </div>
                  <div>
                    <label htmlFor="direccion" className="text-sm font-medium">Dirección</label>
                    <Input 
                      id="direccion" 
                      value={formData.direccion} 
                      onChange={(e) => handleInputChange("direccion", e.target.value)}
                      placeholder="Av. Arequipa 123"
                    />
                  </div>
                  <div>
                    <label htmlFor="tipo" className="text-sm font-medium">Tipo</label>
                    <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Local">Local</SelectItem>
                        <SelectItem value="Parque">Parque</SelectItem>
                        <SelectItem value="Centro Deportivo">Centro Deportivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="capacidad" className="text-sm font-medium">Capacidad</label>
                    <Input 
                      id="capacidad" 
                      type="number"
                      value={formData.capacidad} 
                      onChange={(e) => handleInputChange("capacidad", parseInt(e.target.value) || 50)}
                      min="1"
                      max="500"
                    />
                  </div>
                  <div>
                    <label htmlFor="estado" className="text-sm font-medium">Estado</label>
                    <Select value={formData.estado ? "true" : "false"} onValueChange={(value) => handleInputChange("estado", value === "true")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddLocal} disabled={loading} className="flex-1">
                    {loading ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead
                    className="w-20 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon("id")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("nombre")}
                  >
                    <div className="flex items-center">
                      Nombre
                      {getSortIcon("nombre")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("tipo")}
                  >
                    <div className="flex items-center">
                      Tipo
                      {getSortIcon("tipo")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("direccion")}
                  >
                    <div className="flex items-center">
                      Dirección
                      {getSortIcon("direccion")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-24 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("capacidad")}
                  >
                    <div className="flex items-center">
                      Capacidad
                      {getSortIcon("capacidad")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("estado")}
                  >
                    <div className="flex items-center">
                      Estado
                      {getSortIcon("estado")}
                    </div>
                  </TableHead>
                  <TableHead className="w-32 text-center font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((l) => (
                  <TableRow key={l.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-muted-foreground">
                      #{l.id.toString().padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{l.nombre}</TableCell>
                    <TableCell>{l.tipo}</TableCell>
                    <TableCell className="text-muted-foreground">{l.direccion}</TableCell>
                    <TableCell>{l.capacidad}</TableCell>
                    <TableCell>{getEstadoBadge(l.estado)}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditModal(l.id)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleLocalStatus(l.id)} className="cursor-pointer">
                            {l.estado ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteModal(l.id)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 text-destructive h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <MapPin className="w-8 h-8" />
                        <p className="text-sm">No se encontraron locales</p>
                        {search && <p className="text-xs">Intenta con un término de búsqueda diferente</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, sorted.length)} de {sorted.length}{" "}
                local{sorted.length !== 1 ? "es" : ""}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => !open && setDeleteModal({ open: false, id: 0, name: "" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el local {deleteModal.name}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="destructive"
              onClick={() => deleteModal.id && handleDelete(deleteModal.id)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </Button>
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: 0, name: "" })} className="flex-1">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={editModal.open} onOpenChange={(open) => !open && setEditModal({ open: false, id: 0 })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar local</DialogTitle>
            <DialogDescription>Modifica la información del local.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="edit-nombre" className="text-sm font-medium">Nombre</label>
              <Input 
                id="edit-nombre" 
                value={formData.nombre} 
                onChange={(e) => handleInputChange("nombre", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-direccion" className="text-sm font-medium">Dirección</label>
              <Input 
                id="edit-direccion" 
                value={formData.direccion} 
                onChange={(e) => handleInputChange("direccion", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-tipo" className="text-sm font-medium">Tipo</label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="Parque">Parque</SelectItem>
                  <SelectItem value="Centro Deportivo">Centro Deportivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="edit-capacidad" className="text-sm font-medium">Capacidad</label>
              <Input 
                id="edit-capacidad" 
                type="number"
                value={formData.capacidad} 
                onChange={(e) => handleInputChange("capacidad", parseInt(e.target.value) || 50)}
                min="1"
                max="500"
              />
            </div>
            <div>
              <label htmlFor="edit-estado" className="text-sm font-medium">Estado</label>
              <Select value={formData.estado ? "true" : "false"} onValueChange={(value) => handleInputChange("estado", value === "true")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleEditSave} disabled={loading} className="flex-1">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            <Button variant="outline" onClick={() => setEditModal({ open: false, id: 0 })} className="flex-1">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
