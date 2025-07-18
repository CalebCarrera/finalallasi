"use client"

import { useState, useMemo, useEffect} from "react"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  XCircle, 
  CheckCircle,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EntrenadorFormData, EntrenadorUI } from "@/services/types/Entrenador"
import { getEntrenadores, postEntrenador, putEntrenador, deleteEntrenador } from "@/services/api/entrenador/api" 

export default function EntrenadorPage() {
  const [entrenadores, setEntrenadores] = useState<EntrenadorUI[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<keyof EntrenadorUI>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editModal, setEditModal] = useState({ open: false, id: 0 })
  const [deleteModal, setDeleteModal] = useState({ open: false, id: 0, name: "" })

  const pageSize = 10

  const [formData, setFormData] = useState<EntrenadorFormData>({
    nombres: "",
    apellidos: "",
    dni: "",
    correo: "",
    telefono: "",
    especialidad: ""
  })

  // Filtrar y ordenar entrenadores
  const filtered = useMemo(() => {
    return entrenadores.filter((e) => {
      const searchTerm = search.toLowerCase()
      return (
        e.name.toLowerCase().includes(searchTerm) ||
        e.email.toLowerCase().includes(searchTerm) ||
        e.dni.includes(searchTerm) ||
        e.especialidad.toLowerCase().includes(searchTerm)
      )
    })
  }, [entrenadores, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aValue = a[sortField as keyof EntrenadorUI]
      const bValue = b[sortField as keyof EntrenadorUI]
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
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
  const handleSort = (field: keyof EntrenadorUI) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: keyof EntrenadorUI) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? " ↑" : " ↓"
  }

  const handleInputChange = (field: keyof EntrenadorFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      dni: "",
      correo: "",
      telefono: "",
      especialidad: ""
    })
  }

  const handleAddEntrenador = async () => {
    if (!formData.nombres || !formData.apellidos || !formData.dni) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    try {
      const newEntrenadorData = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dni: formData.dni,
        correo: formData.correo,
        telefono: formData.telefono,
        especialidad: formData.especialidad,
        estado: true
      }

      const result = await postEntrenador(newEntrenadorData)
      if (result) {
        const newEntrenadorUI: EntrenadorUI = {
          id: result.id,
          name: `${result.nombres} ${result.apellidos}`,
          email: result.correo,
          dni: result.dni,
          telefono: result.telefono,
          especialidad: result.especialidad,
          active: result.estado
        }
        setEntrenadores(prev => [...prev, newEntrenadorUI])
        setShowAdd(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error adding entrenador:", error)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (id: number) => {
    const entrenador = entrenadores.find(e => e.id === id)
    if (entrenador) {
      // Parse name back to nombres and apellidos
      const nameParts = entrenador.name.split(' ')
      const nombres = nameParts[0] || ""
      const apellidos = nameParts.slice(1).join(' ') || ""
      
      setFormData({
        nombres,
        apellidos,
        dni: entrenador.dni,
        correo: entrenador.email,
        telefono: entrenador.telefono,
        especialidad: entrenador.especialidad
      })
      setEditModal({ open: true, id })
    }
  }

  const handleEditSave = async () => {
    if (!formData.nombres || !formData.apellidos || !formData.dni) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    try {
      const updatedEntrenadorData = {
        id: editModal.id,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dni: formData.dni,
        correo: formData.correo,
        telefono: formData.telefono,
        especialidad: formData.especialidad,
        estado: true
      }

      const result = await putEntrenador(updatedEntrenadorData)
      if (result) {
        setEntrenadores(prev => 
          prev.map(e => 
            e.id === editModal.id 
              ? {
                  id: result.id,
                  name: `${result.nombres} ${result.apellidos}`,
                  email: result.correo,
                  dni: result.dni,
                  telefono: result.telefono,
                  especialidad: result.especialidad,
                  active: result.estado
                }
              : e
          )
        )
        setEditModal({ open: false, id: 0 })
        resetForm()
      }
    } catch (error) {
      console.error("Error updating entrenador:", error)
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (id: number) => {
    const entrenador = entrenadores.find(e => e.id === id)
    if (entrenador) {
      setDeleteModal({ 
        open: true, 
        id, 
        name: entrenador.name
      })
    }
  }

  const handleDelete = async (id: number) => {
    setLoading(true)
    try {
      const success = await deleteEntrenador(id)
      if (success) {
        setEntrenadores(prev => prev.filter(e => e.id !== id))
        setDeleteModal({ open: false, id: 0, name: "" })
      }
    } catch (error) {
      console.error("Error deleting entrenador:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEntrenadorStatus = (id: number) => {
    setEntrenadores(prev => 
      prev.map(e => 
        e.id === id 
          ? { ...e, active: !e.active }
          : e
      )
    )
  }

    useEffect(() => {
    async function fetchEntrenadores() {
      setLoading(true)
      try {
        const data = await getEntrenadores()
        if (data) {
          const mapped = data.map((e) => ({
            id: e.id,
            name: `${e.nombres} ${e.apellidos}`,
            email: e.correo,
            dni: e.dni,
            telefono: e.telefono,
            especialidad: e.especialidad,
            active: e.estado
          }))
          setEntrenadores(mapped)
        }
      } catch (error) {
        console.error("Error fetching entrenadores:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEntrenadores()
  }, [])


  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Entrenadores</h1>
          <p className="text-muted-foreground">Gestiona tu equipo de entrenadores de manera eficiente</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <Users className="w-4 h-4 mr-1" />
          {filtered.length} entrenador{filtered.length !== 1 ? "es" : ""}
        </Badge>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar entrenador..."
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
                  Agregar Entrenador
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Agregar entrenador</DialogTitle>
                  <DialogDescription>Completa la información del nuevo entrenador</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="nombres" className="text-sm font-medium">Nombres</label>
                      <Input 
                        id="nombres" 
                        value={formData.nombres} 
                        onChange={(e) => handleInputChange("nombres", e.target.value)}
                        placeholder="Carlos"
                      />
                    </div>
                    <div>
                      <label htmlFor="apellidos" className="text-sm font-medium">Apellidos</label>
                      <Input 
                        id="apellidos" 
                        value={formData.apellidos} 
                        onChange={(e) => handleInputChange("apellidos", e.target.value)}
                        placeholder="García"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="dni" className="text-sm font-medium">DNI</label>
                    <Input 
                      id="dni" 
                      value={formData.dni} 
                      onChange={(e) => handleInputChange("dni", e.target.value)}
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <label htmlFor="correo" className="text-sm font-medium">Email</label>
                    <Input 
                      id="correo" 
                      type="email"
                      value={formData.correo} 
                      onChange={(e) => handleInputChange("correo", e.target.value)}
                      placeholder="carlos@gym.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="text-sm font-medium">Teléfono</label>
                    <Input 
                      id="telefono" 
                      value={formData.telefono} 
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  <div>
                    <label htmlFor="especialidad" className="text-sm font-medium">Especialidad</label>
                    <Input 
                      id="especialidad" 
                      value={formData.especialidad} 
                      onChange={(e) => handleInputChange("especialidad", e.target.value)}
                      placeholder="Musculación"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddEntrenador} disabled={loading} className="flex-1">
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
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Nombre
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {getSortIcon("email")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("dni")}
                  >
                    <div className="flex items-center">
                      DNI
                      {getSortIcon("dni")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-40 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("telefono")}
                  >
                    <div className="flex items-center">
                      Teléfono
                      {getSortIcon("telefono")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("especialidad")}
                  >
                    <div className="flex items-center">
                      Especialidad
                      {getSortIcon("especialidad")}
                    </div>
                  </TableHead>
                  <TableHead className="w-32 text-center font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((e) => (
                  <TableRow key={e.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-muted-foreground">
                      #{e.id.toString().padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="text-muted-foreground">{e.email}</TableCell>
                    <TableCell>{e.dni}</TableCell>
                    <TableCell>{e.telefono}</TableCell>
                    <TableCell>{e.especialidad}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditModal(e.id)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleEntrenadorStatus(e.id)} className="cursor-pointer">
                            {e.active ? (
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
                            onClick={() => openDeleteModal(e.id)}
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
                    <TableCell colSpan={10} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="w-8 h-8" />
                        <p className="text-sm">No se encontraron entrenadores</p>
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
                entrenador{sorted.length !== 1 ? "es" : ""}
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
              ¿Estás seguro de que deseas eliminar al entrenador {deleteModal.name}? Esta acción no se puede deshacer.
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
            <DialogTitle>Editar entrenador</DialogTitle>
            <DialogDescription>Modifica la información del entrenador.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-nombres" className="text-sm font-medium">Nombres</label>
                <Input 
                  id="edit-nombres" 
                  value={formData.nombres} 
                  onChange={(e) => handleInputChange("nombres", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-apellidos" className="text-sm font-medium">Apellidos</label>
                <Input 
                  id="edit-apellidos" 
                  value={formData.apellidos} 
                  onChange={(e) => handleInputChange("apellidos", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-dni" className="text-sm font-medium">DNI</label>
              <Input 
                id="edit-dni" 
                value={formData.dni} 
                onChange={(e) => handleInputChange("dni", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-correo" className="text-sm font-medium">Email</label>
              <Input 
                id="edit-correo" 
                type="email"
                value={formData.correo} 
                onChange={(e) => handleInputChange("correo", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-telefono" className="text-sm font-medium">Teléfono</label>
              <Input 
                id="edit-telefono" 
                value={formData.telefono} 
                onChange={(e) => handleInputChange("telefono", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-especialidad" className="text-sm font-medium">Especialidad</label>
              <Input 
                id="edit-especialidad" 
                value={formData.especialidad} 
                onChange={(e) => handleInputChange("especialidad", e.target.value)}
              />
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
