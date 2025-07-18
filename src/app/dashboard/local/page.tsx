"use client"

import { useState, useMemo } from "react"
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

// Datos de ejemplo para locales
const localesData: Local[] = [
  {
    id: 1,
    nombre: "Gym Central",
    direccion: "Av. Arequipa 123",
    distrito: "Miraflores",
    telefono: "+51 1 444-0001",
    capacidad: 150,
    horarioApertura: "06:00",
    horarioCierre: "23:00",
    estado: "Activo",
    encargado: "Juan Pérez",
    active: true
  },
  {
    id: 2,
    nombre: "Gym Norte",
    direccion: "Av. Javier Prado 456",
    distrito: "San Isidro",
    telefono: "+51 1 444-0002",
    capacidad: 120,
    horarioApertura: "05:30",
    horarioCierre: "22:30",
    estado: "Activo",
    encargado: "María García",
    active: true
  },
  {
    id: 3,
    nombre: "Gym Sur",
    direccion: "Av. La Marina 789",
    distrito: "San Miguel",
    telefono: "+51 1 444-0003",
    capacidad: 100,
    horarioApertura: "06:00",
    horarioCierre: "22:00",
    estado: "Mantenimiento",
    encargado: "Carlos López",
    active: false
  },
  {
    id: 4,
    nombre: "Gym Este",
    direccion: "Av. Universitaria 321",
    distrito: "Los Olivos",
    telefono: "+51 1 444-0004",
    capacidad: 80,
    horarioApertura: "07:00",
    horarioCierre: "21:00",
    estado: "Activo",
    encargado: "Ana Martínez",
    active: true
  },
  {
    id: 5,
    nombre: "Gym Oeste",
    direccion: "Av. Brasil 654",
    distrito: "Breña",
    telefono: "+51 1 444-0005",
    capacidad: 90,
    horarioApertura: "06:30",
    horarioCierre: "22:30",
    estado: "Cerrado",
    encargado: "Roberto Silva",
    active: false
  }
]

export default function LocalPage() {
  const [locales, setLocales] = useState<Local[]>(localesData)
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
    distrito: "",
    telefono: "",
    capacidad: 100,
    horarioApertura: "06:00",
    horarioCierre: "22:00",
    estado: "Activo",
    encargado: ""
  })

  // Filtrar y ordenar locales
  const filtered = useMemo(() => {
    return locales.filter((l) => {
      const searchTerm = search.toLowerCase()
      return (
        l.nombre.toLowerCase().includes(searchTerm) ||
        l.direccion.toLowerCase().includes(searchTerm) ||
        l.distrito.toLowerCase().includes(searchTerm) ||
        l.encargado.toLowerCase().includes(searchTerm)
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

  const handleInputChange = (field: keyof LocalFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      direccion: "",
      distrito: "",
      telefono: "",
      capacidad: 100,
      horarioApertura: "06:00",
      horarioCierre: "22:00",
      estado: "Activo",
      encargado: ""
    })
  }

  const handleAddLocal = async () => {
    if (!formData.nombre || !formData.direccion || !formData.distrito) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newLocal: Local = {
      id: Math.max(...locales.map(l => l.id)) + 1,
      ...formData,
      active: true
    }

    setLocales(prev => [...prev, newLocal])
    setShowAdd(false)
    resetForm()
    setLoading(false)
  }

  const openEditModal = (id: number) => {
    const local = locales.find(l => l.id === id)
    if (local) {
      setFormData({
        nombre: local.nombre,
        direccion: local.direccion,
        distrito: local.distrito,
        telefono: local.telefono,
        capacidad: local.capacidad,
        horarioApertura: local.horarioApertura,
        horarioCierre: local.horarioCierre,
        estado: local.estado,
        encargado: local.encargado
      })
      setEditModal({ open: true, id })
    }
  }

  const handleEditSave = async () => {
    if (!formData.nombre || !formData.direccion || !formData.distrito) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    setLocales(prev => 
      prev.map(l => 
        l.id === editModal.id 
          ? { ...l, ...formData }
          : l
      )
    )
    setEditModal({ open: false, id: 0 })
    resetForm()
    setLoading(false)
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
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    setLocales(prev => prev.filter(l => l.id !== id))
    setDeleteModal({ open: false, id: 0, name: "" })
    setLoading(false)
  }

  const toggleLocalStatus = async (id: number) => {
    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500))

    setLocales(prev => 
      prev.map(l => 
        l.id === id 
          ? { ...l, active: !l.active }
          : l
      )
    )
    setLoading(false)
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Activo":
        return <Badge variant="default" className="bg-green-500">Activo</Badge>
      case "Mantenimiento":
        return <Badge variant="secondary" className="bg-yellow-500">Mantenimiento</Badge>
      case "Cerrado":
        return <Badge variant="destructive">Cerrado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
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
                    <label htmlFor="distrito" className="text-sm font-medium">Distrito</label>
                    <Input 
                      id="distrito" 
                      value={formData.distrito} 
                      onChange={(e) => handleInputChange("distrito", e.target.value)}
                      placeholder="Miraflores"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="text-sm font-medium">Teléfono</label>
                    <Input 
                      id="telefono" 
                      value={formData.telefono} 
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="+51 1 444-0001"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="capacidad" className="text-sm font-medium">Capacidad</label>
                      <Input 
                        id="capacidad" 
                        type="number"
                        value={formData.capacidad} 
                        onChange={(e) => handleInputChange("capacidad", parseInt(e.target.value) || 100)}
                        min="1"
                        max="500"
                      />
                    </div>
                    <div>
                      <label htmlFor="estado" className="text-sm font-medium">Estado</label>
                      <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                          <SelectItem value="Cerrado">Cerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="horarioApertura" className="text-sm font-medium">Apertura</label>
                      <Input 
                        id="horarioApertura" 
                        type="time"
                        value={formData.horarioApertura} 
                        onChange={(e) => handleInputChange("horarioApertura", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="horarioCierre" className="text-sm font-medium">Cierre</label>
                      <Input 
                        id="horarioCierre" 
                        type="time"
                        value={formData.horarioCierre} 
                        onChange={(e) => handleInputChange("horarioCierre", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="encargado" className="text-sm font-medium">Encargado</label>
                    <Input 
                      id="encargado" 
                      value={formData.encargado} 
                      onChange={(e) => handleInputChange("encargado", e.target.value)}
                      placeholder="Juan Pérez"
                    />
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
                    onClick={() => handleSort("distrito")}
                  >
                    <div className="flex items-center">
                      Distrito
                      {getSortIcon("distrito")}
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
                    className="w-40 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("telefono")}
                  >
                    <div className="flex items-center">
                      Teléfono
                      {getSortIcon("telefono")}
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
                  <TableHead
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("horarioApertura")}
                  >
                    <div className="flex items-center">
                      Horario
                      {getSortIcon("horarioApertura")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("encargado")}
                  >
                    <div className="flex items-center">
                      Encargado
                      {getSortIcon("encargado")}
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
                    <TableCell>{l.distrito}</TableCell>
                    <TableCell className="text-muted-foreground">{l.direccion}</TableCell>
                    <TableCell>{l.telefono}</TableCell>
                    <TableCell>{l.capacidad}</TableCell>
                    <TableCell>{getEstadoBadge(l.estado)}</TableCell>
                    <TableCell>{l.horarioApertura} - {l.horarioCierre}</TableCell>
                    <TableCell className="text-muted-foreground">{l.encargado}</TableCell>
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
                            {l.active ? (
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
                    <TableCell colSpan={10} className="h-32 text-center">
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
              <label htmlFor="edit-distrito" className="text-sm font-medium">Distrito</label>
              <Input 
                id="edit-distrito" 
                value={formData.distrito} 
                onChange={(e) => handleInputChange("distrito", e.target.value)}
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-capacidad" className="text-sm font-medium">Capacidad</label>
                <Input 
                  id="edit-capacidad" 
                  type="number"
                  value={formData.capacidad} 
                  onChange={(e) => handleInputChange("capacidad", parseInt(e.target.value) || 100)}
                  min="1"
                  max="500"
                />
              </div>
              <div>
                <label htmlFor="edit-estado" className="text-sm font-medium">Estado</label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="Cerrado">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-horarioApertura" className="text-sm font-medium">Apertura</label>
                <Input 
                  id="edit-horarioApertura" 
                  type="time"
                  value={formData.horarioApertura} 
                  onChange={(e) => handleInputChange("horarioApertura", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-horarioCierre" className="text-sm font-medium">Cierre</label>
                <Input 
                  id="edit-horarioCierre" 
                  type="time"
                  value={formData.horarioCierre} 
                  onChange={(e) => handleInputChange("horarioCierre", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-encargado" className="text-sm font-medium">Encargado</label>
              <Input 
                id="edit-encargado" 
                value={formData.encargado} 
                onChange={(e) => handleInputChange("encargado", e.target.value)}
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
