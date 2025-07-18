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
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Reserva, ReservaFormData } from "@/services/types/Reserva"

// Datos de ejemplo para reservas
const reservasData: Reserva[] = [
  {
    id: 1,
    clienteId: 1,
    clienteNombre: "Juan Pérez",
    entrenamientoId: 1,
    entrenamientoNombre: "Musculación Básica",
    localId: 1,
    localNombre: "Gym Central",
    fecha: "2024-01-15",
    hora: "08:00",
    estado: "Confirmada",
    precio: 25,
    fechaReserva: "2024-01-10",
    active: true
  },
  {
    id: 2,
    clienteId: 2,
    clienteNombre: "María García",
    entrenamientoId: 2,
    entrenamientoNombre: "Yoga Flow",
    localId: 1,
    localNombre: "Gym Central",
    fecha: "2024-01-15",
    hora: "10:00",
    estado: "Pendiente",
    precio: 30,
    fechaReserva: "2024-01-11",
    active: true
  },
  {
    id: 3,
    clienteId: 3,
    clienteNombre: "Carlos López",
    entrenamientoId: 3,
    entrenamientoNombre: "CrossFit Intenso",
    localId: 2,
    localNombre: "Gym Norte",
    fecha: "2024-01-16",
    hora: "07:00",
    estado: "Confirmada",
    precio: 35,
    fechaReserva: "2024-01-12",
    active: true
  },
  {
    id: 4,
    clienteId: 4,
    clienteNombre: "Ana Martínez",
    entrenamientoId: 4,
    entrenamientoNombre: "Cardio Dance",
    localId: 3,
    localNombre: "Gym Sur",
    fecha: "2024-01-14",
    hora: "18:00",
    estado: "Cancelada",
    precio: 20,
    fechaReserva: "2024-01-09",
    active: false
  },
  {
    id: 5,
    clienteId: 5,
    clienteNombre: "Roberto Silva",
    entrenamientoId: 5,
    entrenamientoNombre: "Spinning Pro",
    localId: 4,
    localNombre: "Gym Este",
    fecha: "2024-01-17",
    hora: "19:00",
    estado: "Completada",
    precio: 28,
    fechaReserva: "2024-01-13",
    active: true
  }
]

export default function ReservaPage() {
  const [reservas, setReservas] = useState<Reserva[]>(reservasData)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Reserva>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editModal, setEditModal] = useState({ open: false, id: 0 })
  const [deleteModal, setDeleteModal] = useState({ open: false, id: 0, name: "" })

  const pageSize = 10

  const [formData, setFormData] = useState<ReservaFormData>({
    clienteId: 1,
    entrenamientoId: 1,
    localId: 1,
    fecha: "",
    hora: "",
    estado: "Pendiente",
    precio: 0
  })

  // Filtrar y ordenar reservas
  const filtered = useMemo(() => {
    return reservas.filter((r) => {
      const searchTerm = search.toLowerCase()
      return (
        r.clienteNombre.toLowerCase().includes(searchTerm) ||
        r.entrenamientoNombre.toLowerCase().includes(searchTerm) ||
        r.localNombre.toLowerCase().includes(searchTerm) ||
        r.fecha.includes(searchTerm) ||
        r.estado.toLowerCase().includes(searchTerm)
      )
    })
  }, [reservas, search])

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
  const handleSort = (field: keyof Reserva) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: keyof Reserva) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? " ↑" : " ↓"
  }

  const handleInputChange = (field: keyof ReservaFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      clienteId: 1,
      entrenamientoId: 1,
      localId: 1,
      fecha: "",
      hora: "",
      estado: "Pendiente",
      precio: 0
    })
  }

  const handleAddReserva = async () => {
    if (!formData.fecha || !formData.hora) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const cliente = reservas.find(r => r.clienteId === formData.clienteId)
    const entrenamiento = reservas.find(r => r.entrenamientoId === formData.entrenamientoId)
    const local = reservas.find(r => r.localId === formData.localId)

    const newReserva: Reserva = {
      id: Math.max(...reservas.map(r => r.id)) + 1,
      ...formData,
      clienteNombre: cliente?.clienteNombre || "Cliente",
      entrenamientoNombre: entrenamiento?.entrenamientoNombre || "Entrenamiento",
      localNombre: local?.localNombre || "Local",
      fechaReserva: new Date().toISOString().split('T')[0],
      active: true
    }

    setReservas(prev => [...prev, newReserva])
    setShowAdd(false)
    resetForm()
    setLoading(false)
  }

  const openEditModal = (id: number) => {
    const reserva = reservas.find(r => r.id === id)
    if (reserva) {
      setFormData({
        clienteId: reserva.clienteId,
        entrenamientoId: reserva.entrenamientoId,
        localId: reserva.localId,
        fecha: reserva.fecha,
        hora: reserva.hora,
        estado: reserva.estado,
        precio: reserva.precio
      })
      setEditModal({ open: true, id })
    }
  }

  const handleEditSave = async () => {
    if (!formData.fecha || !formData.hora) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const cliente = reservas.find(r => r.clienteId === formData.clienteId)
    const entrenamiento = reservas.find(r => r.entrenamientoId === formData.entrenamientoId)
    const local = reservas.find(r => r.localId === formData.localId)

    setReservas(prev => 
      prev.map(r => 
        r.id === editModal.id 
          ? { 
              ...r, 
              ...formData,
              clienteNombre: cliente?.clienteNombre || r.clienteNombre,
              entrenamientoNombre: entrenamiento?.entrenamientoNombre || r.entrenamientoNombre,
              localNombre: local?.localNombre || r.localNombre
            }
          : r
      )
    )
    setEditModal({ open: false, id: 0 })
    resetForm()
    setLoading(false)
  }

  const openDeleteModal = (id: number) => {
    const reserva = reservas.find(r => r.id === id)
    if (reserva) {
      setDeleteModal({ 
        open: true, 
        id, 
        name: `${reserva.clienteNombre} - ${reserva.entrenamientoNombre}` 
      })
    }
  }

  const handleDelete = async (id: number) => {
    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    setReservas(prev => prev.filter(r => r.id !== id))
    setDeleteModal({ open: false, id: 0, name: "" })
    setLoading(false)
  }

  const toggleReservaStatus = async (id: number) => {
    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500))

    setReservas(prev => 
      prev.map(r => 
        r.id === id 
          ? { ...r, active: !r.active }
          : r
      )
    )
    setLoading(false)
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Confirmada":
        return <Badge variant="default" className="bg-green-500">Confirmada</Badge>
      case "Pendiente":
        return <Badge variant="secondary" className="bg-yellow-500">Pendiente</Badge>
      case "Cancelada":
        return <Badge variant="destructive">Cancelada</Badge>
      case "Completada":
        return <Badge variant="outline" className="bg-blue-500">Completada</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">Gestiona las reservas y citas de entrenamiento</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <Calendar className="w-4 h-4 mr-1" />
          {filtered.length} reserva{filtered.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar reserva..."
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
                  Agregar Reserva
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Agregar reserva</DialogTitle>
                  <DialogDescription>Completa la información de la nueva reserva</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="clienteId" className="text-sm font-medium">Cliente ID</label>
                      <Input 
                        id="clienteId" 
                        type="number"
                        value={formData.clienteId} 
                        onChange={(e) => handleInputChange("clienteId", parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    <div>
                      <label htmlFor="entrenamientoId" className="text-sm font-medium">Entrenamiento ID</label>
                      <Input 
                        id="entrenamientoId" 
                        type="number"
                        value={formData.entrenamientoId} 
                        onChange={(e) => handleInputChange("entrenamientoId", parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="localId" className="text-sm font-medium">Local ID</label>
                    <Input 
                      id="localId" 
                      type="number"
                      value={formData.localId} 
                      onChange={(e) => handleInputChange("localId", parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="fecha" className="text-sm font-medium">Fecha</label>
                      <Input 
                        id="fecha" 
                        type="date"
                        value={formData.fecha} 
                        onChange={(e) => handleInputChange("fecha", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="hora" className="text-sm font-medium">Hora</label>
                      <Input 
                        id="hora" 
                        type="time"
                        value={formData.hora} 
                        onChange={(e) => handleInputChange("hora", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="estado" className="text-sm font-medium">Estado</label>
                      <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Confirmada">Confirmada</SelectItem>
                          <SelectItem value="Cancelada">Cancelada</SelectItem>
                          <SelectItem value="Completada">Completada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="precio" className="text-sm font-medium">Precio (S/)</label>
                      <Input 
                        id="precio" 
                        type="number"
                        value={formData.precio} 
                        onChange={(e) => handleInputChange("precio", parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddReserva} disabled={loading} className="flex-1">
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
                    onClick={() => handleSort("clienteNombre")}
                  >
                    <div className="flex items-center">
                      Cliente
                      {getSortIcon("clienteNombre")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("entrenamientoNombre")}
                  >
                    <div className="flex items-center">
                      Entrenamiento
                      {getSortIcon("entrenamientoNombre")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("localNombre")}
                  >
                    <div className="flex items-center">
                      Local
                      {getSortIcon("localNombre")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("fecha")}
                  >
                    <div className="flex items-center">
                      Fecha
                      {getSortIcon("fecha")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-24 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("hora")}
                  >
                    <div className="flex items-center">
                      Hora
                      {getSortIcon("hora")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-28 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("estado")}
                  >
                    <div className="flex items-center">
                      Estado
                      {getSortIcon("estado")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-20 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("precio")}
                  >
                    <div className="flex items-center">
                      Precio
                      {getSortIcon("precio")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("fechaReserva")}
                  >
                    <div className="flex items-center">
                      Fecha Reserva
                      {getSortIcon("fechaReserva")}
                    </div>
                  </TableHead>
                  <TableHead className="w-32 text-center font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-muted-foreground">
                      #{r.id.toString().padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{r.clienteNombre}</TableCell>
                    <TableCell className="text-muted-foreground">{r.entrenamientoNombre}</TableCell>
                    <TableCell className="text-muted-foreground">{r.localNombre}</TableCell>
                    <TableCell>{r.fecha}</TableCell>
                    <TableCell>{r.hora}</TableCell>
                    <TableCell>{getEstadoBadge(r.estado)}</TableCell>
                    <TableCell>S/ {r.precio}</TableCell>
                    <TableCell className="text-muted-foreground">{r.fechaReserva}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditModal(r.id)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleReservaStatus(r.id)} className="cursor-pointer">
                            {r.active ? (
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
                            onClick={() => openDeleteModal(r.id)}
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
                        <Calendar className="w-8 h-8" />
                        <p className="text-sm">No se encontraron reservas</p>
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
                reserva{sorted.length !== 1 ? "s" : ""}
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
              ¿Estás seguro de que deseas eliminar la reserva {deleteModal.name}? Esta acción no se puede deshacer.
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
            <DialogTitle>Editar reserva</DialogTitle>
            <DialogDescription>Modifica la información de la reserva.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-clienteId" className="text-sm font-medium">Cliente ID</label>
                <Input 
                  id="edit-clienteId" 
                  type="number"
                  value={formData.clienteId} 
                  onChange={(e) => handleInputChange("clienteId", parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              <div>
                <label htmlFor="edit-entrenamientoId" className="text-sm font-medium">Entrenamiento ID</label>
                <Input 
                  id="edit-entrenamientoId" 
                  type="number"
                  value={formData.entrenamientoId} 
                  onChange={(e) => handleInputChange("entrenamientoId", parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-localId" className="text-sm font-medium">Local ID</label>
              <Input 
                id="edit-localId" 
                type="number"
                value={formData.localId} 
                onChange={(e) => handleInputChange("localId", parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-fecha" className="text-sm font-medium">Fecha</label>
                <Input 
                  id="edit-fecha" 
                  type="date"
                  value={formData.fecha} 
                  onChange={(e) => handleInputChange("fecha", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-hora" className="text-sm font-medium">Hora</label>
                <Input 
                  id="edit-hora" 
                  type="time"
                  value={formData.hora} 
                  onChange={(e) => handleInputChange("hora", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-estado" className="text-sm font-medium">Estado</label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Confirmada">Confirmada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                    <SelectItem value="Completada">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="edit-precio" className="text-sm font-medium">Precio (S/)</label>
                <Input 
                  id="edit-precio" 
                  type="number"
                  value={formData.precio} 
                  onChange={(e) => handleInputChange("precio", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
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
