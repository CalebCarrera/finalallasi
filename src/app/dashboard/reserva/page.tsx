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
import { Reserva } from "@/services/types/Reserva"
import { getReservas, postReserva, putReserva, deleteReserva } from "@/services/api/reserva"

// Tipo para el formulario de reserva
type ReservaFormData = Omit<Reserva, 'reservaId'>;

export default function ReservaPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Reserva>("reservaId")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editModal, setEditModal] = useState({ open: false, id: 0 })
  const [deleteModal, setDeleteModal] = useState({ open: false, id: 0, name: "" })

  const pageSize = 10

  // Obtener listas únicas de clientes, entrenamientos y locales
  const clientes = useMemo(() => {
    const map = new Map<number, Reserva["cliente"]>()
    reservas.forEach(r => {
      if (r.cliente) map.set(r.cliente.clienteId, r.cliente)
    })
    return Array.from(map.values())
  }, [reservas])

  const entrenamientos = useMemo(() => {
    const map = new Map<number, Reserva["entrenamiento"]>()
    reservas.forEach(r => {
      if (r.entrenamiento) map.set(r.entrenamiento.entrenamientoId, r.entrenamiento)
    })
    return Array.from(map.values())
  }, [reservas])

  const locales = useMemo(() => {
    const map = new Map<number, Reserva["entrenamiento"]["local"]>()
    reservas.forEach(r => {
      if (r.entrenamiento?.local) map.set(r.entrenamiento.local.id, r.entrenamiento.local)
    })
    return Array.from(map.values())
  }, [reservas])

  // Valores por defecto después de tener los arrays
  const defaultCliente = clientes[0] || {
    clienteId: 1,
    nombres: '',
    apellidos: '',
    dni: '',
    correo: '',
    telefono: '',
    fechaInicio: '',
    fechaFin: '',
    faltas: 0,
    planId: 1
  };
  const defaultLocal = locales[0] || {
    id: 1,
    nombre: '',
    direccion: '',
    tipo: '',
    capacidad: 0,
    estado: true
  };
  const defaultEntrenador = entrenamientos[0]?.entrenador || {
    id: 1,
    nombres: '',
    apellidos: '',
    dni: '',
    correo: '',
    telefono: '',
    especialidad: '',
    estado: true
  };
  const defaultEntrenamiento = entrenamientos[0] || {
    entrenamientoId: 1,
    tipo: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    maxParticipantes: 0,
    descripcion: '',
    informe: null,
    local: defaultLocal,
    entrenador: defaultEntrenador
  };

  const [formData, setFormData] = useState<ReservaFormData>({
    cliente: defaultCliente,
    entrenamiento: defaultEntrenamiento,
    fechaReserva: new Date().toISOString(),
    asistencia: null,
    nombreCliente: defaultCliente.nombres,
    apellidoCliente: defaultCliente.apellidos
  })

  // Cargar reservas al montar el componente
  useEffect(() => {
    loadReservas()
  }, [])

  const loadReservas = async () => {
    setLoading(true)
    try {
      const data = await getReservas()
      setReservas(data)
    } catch (error) {
      console.error("Error loading reservas:", error)
    }
    setLoading(false)
  }

  // Filtrar y ordenar reservas
  const filtered = useMemo(() => {
    return reservas.filter((r) => {
      const searchTerm = search.toLowerCase()
      return (
        ((r.cliente?.nombres + ' ' + r.cliente?.apellidos).toLowerCase().includes(searchTerm)) ||
        (r.entrenamiento?.tipo?.toLowerCase().includes(searchTerm) || false) ||
        (r.entrenamiento?.local?.nombre?.toLowerCase().includes(searchTerm) || false) ||
        (r.fechaReserva?.includes(searchTerm) || false)
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

  const handleInputChange = (field: keyof ReservaFormData, value: string | number | boolean | any) => {
    setFormData((prev: ReservaFormData) => ({ ...prev, [field]: value }))
  }

  const handleClienteChange = (clienteId: number) => {
    const cliente = clientes.find(c => c.clienteId === clienteId) || defaultCliente
    setFormData(prev => ({
      ...prev,
      cliente
    }))
  }

  const handleEntrenamientoChange = (entrenamientoId: number) => {
    const entrenamiento = entrenamientos.find(e => e.entrenamientoId === entrenamientoId) || defaultEntrenamiento
    setFormData(prev => ({
      ...prev,
      entrenamiento
    }))
  }

  const handleLocalChange = (localId: number) => {
    const local = locales.find(l => l.id === localId) || defaultLocal
    setFormData(prev => ({
      ...prev,
      entrenamiento: {
        ...prev.entrenamiento,
        local
      }
    }))
  }

  const resetForm = () => {
    setFormData({
      cliente: defaultCliente,
      entrenamiento: defaultEntrenamiento,
      fechaReserva: new Date().toISOString(),
      asistencia: null,
      nombreCliente: defaultCliente.nombres,
      apellidoCliente: defaultCliente.apellidos
    })
  }

  const handleAddReserva = async () => {
    if (!formData.fechaReserva || !formData.cliente?.clienteId || !formData.entrenamiento?.entrenamientoId) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    const result = await postReserva(formData)
    if (result) {
      setReservas(prev => [...prev, result])
      setShowAdd(false)
      resetForm()
    } else {
      alert("Error al guardar la reserva")
    }
    setLoading(false)
  }

  const openEditModal = (id: number) => {
    const reserva = reservas.find(r => r.reservaId === id)
    if (reserva) {
      setFormData({
        cliente: reserva.cliente,
        entrenamiento: reserva.entrenamiento,
        fechaReserva: reserva.fechaReserva,
        asistencia: reserva.asistencia,
        nombreCliente: reserva.cliente.nombres,
        apellidoCliente: reserva.cliente.apellidos
      })
      setEditModal({ open: true, id })
    }
  }

  const handleEditSave = async () => {
    if (!formData.fechaReserva || !formData.cliente?.clienteId || !formData.entrenamiento?.entrenamientoId) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    const result = await putReserva({ ...formData, reservaId: editModal.id })
    if (result) {
      setReservas(prev => 
        prev.map(r => r.reservaId === result.reservaId ? result : r)
      )
      setEditModal({ open: false, id: 0 })
      resetForm()
    } else {
      alert("Error al actualizar la reserva")
    }
    setLoading(false)
  }

  const openDeleteModal = (id: number) => {
    const reserva = reservas.find(r => r.reservaId === id)
    if (reserva) {
      setDeleteModal({ 
        open: true, 
        id, 
        name: `${reserva.cliente?.nombres || ''} ${reserva.cliente?.apellidos || ''} - ${reserva.entrenamiento?.tipo || 'Entrenamiento'}` 
      })
    }
  }

  const handleDelete = async (id: number) => {
    setLoading(true)
    const success = await deleteReserva(id)
    if (success) {
      setReservas(prev => prev.filter(r => r.reservaId !== id))
      setDeleteModal({ open: false, id: 0, name: "" })
    } else {
      alert("Error al eliminar la reserva")
    }
    setLoading(false)
  }

  const toggleReservaStatus = async (id: number) => {
    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500))

    setReservas(prev => 
      prev.map(r => 
        r.reservaId === id 
          ? { ...r, asistencia: !r.asistencia }
          : r
      )
    )
    setLoading(false)
  }

  const getAsistenciaBadge = (asistencia: boolean | null) => {
    if (asistencia === null) {
      return <Badge variant="secondary" className="bg-gray-500">Pendiente</Badge>
    } else if (asistencia) {
      return <Badge variant="default" className="bg-green-500">Asistió</Badge>
    } else {
      return <Badge variant="destructive">No Asistió</Badge>
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
                      <label htmlFor="clienteId" className="text-sm font-medium">Cliente</label>
                      <Select
                        value={formData.cliente?.clienteId ? String(formData.cliente.clienteId) : ""}
                        onValueChange={v => handleClienteChange(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map(c => (
                            <SelectItem key={c.clienteId} value={String(c.clienteId)}>
                              {c.nombres} {c.apellidos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="entrenamientoId" className="text-sm font-medium">Entrenamiento</label>
                      <Select
                        value={formData.entrenamiento?.entrenamientoId ? String(formData.entrenamiento.entrenamientoId) : ""}
                        onValueChange={v => handleEntrenamientoChange(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar entrenamiento" />
                        </SelectTrigger>
                        <SelectContent>
                          {entrenamientos.map(e => (
                            <SelectItem key={e.entrenamientoId} value={String(e.entrenamientoId)}>
                              {e.tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="localId" className="text-sm font-medium">Local</label>
                    <Select
                      value={formData.entrenamiento?.local?.id ? String(formData.entrenamiento.local.id) : ""}
                      onValueChange={v => handleLocalChange(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar local" />
                      </SelectTrigger>
                      <SelectContent>
                        {locales.map(l => (
                          <SelectItem key={l.id} value={String(l.id)}>
                            {l.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="fechaReserva" className="text-sm font-medium">Fecha de Reserva</label>
                    <Input 
                      id="fechaReserva" 
                      type="datetime-local"
                      value={formData.fechaReserva ? formData.fechaReserva.slice(0, 16) : ""} 
                      onChange={(e) => handleInputChange("fechaReserva", e.target.value + ":00")}
                    />
                  </div>
                  <div>
                    <label htmlFor="asistencia" className="text-sm font-medium">Asistencia</label>
                    <Select 
                      value={formData.asistencia === null ? "null" : formData.asistencia.toString()} 
                      onValueChange={(value) => handleInputChange("asistencia", value === "null" ? null : value === "true")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar asistencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">Pendiente</SelectItem>
                        <SelectItem value="true">Asistió</SelectItem>
                        <SelectItem value="false">No Asistió</SelectItem>
                      </SelectContent>
                    </Select>
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
                    onClick={() => handleSort("reservaId")}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon("reservaId")}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Entrenamiento</TableHead>
                  <TableHead className="font-semibold">Local</TableHead>
                  <TableHead
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("fechaReserva")}
                  >
                    <div className="flex items-center">
                      Fecha Reserva
                      {getSortIcon("fechaReserva")}
                    </div>
                  </TableHead>
                  <TableHead className="w-28 font-semibold">Asistencia</TableHead>
                  <TableHead className="w-32 text-center font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((r) => (
                  <TableRow key={r.reservaId} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-muted-foreground">
                      #{r.reservaId?.toString().padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{r.cliente ? `${r.cliente.nombres} ${r.cliente.apellidos}` : 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{r.entrenamiento?.tipo || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{r.entrenamiento?.local?.nombre || 'N/A'}</TableCell>
                    <TableCell>{r.fechaReserva ? new Date(r.fechaReserva).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}</TableCell>
                    <TableCell>{getAsistenciaBadge(r.asistencia)}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditModal(r.reservaId || 0)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleReservaStatus(r.reservaId || 0)} className="cursor-pointer">
                            {r.asistencia === null ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar Asistió
                              </>
                            ) : r.asistencia ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Marcar No Asistió
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar Asistió
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteModal(r.reservaId || 0)}
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
                    <TableCell colSpan={6} className="h-32 text-center">
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
                <label htmlFor="edit-clienteId" className="text-sm font-medium">Cliente</label>
                <Select
                  value={formData.cliente?.clienteId ? String(formData.cliente.clienteId) : ""}
                  onValueChange={v => handleClienteChange(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(c => (
                      <SelectItem key={c.clienteId} value={String(c.clienteId)}>
                        {c.nombres} {c.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="edit-entrenamientoId" className="text-sm font-medium">Entrenamiento</label>
                <Select
                  value={formData.entrenamiento?.entrenamientoId ? String(formData.entrenamiento.entrenamientoId) : ""}
                  onValueChange={v => handleEntrenamientoChange(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar entrenamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {entrenamientos.map(e => (
                      <SelectItem key={e.entrenamientoId} value={String(e.entrenamientoId)}>
                        {e.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label htmlFor="localId" className="text-sm font-medium">Local</label>
              <Select
                value={formData.entrenamiento?.local?.id ? String(formData.entrenamiento.local.id) : ""}
                onValueChange={v => handleLocalChange(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar local" />
                </SelectTrigger>
                <SelectContent>
                  {locales.map(l => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="edit-fechaReserva" className="text-sm font-medium">Fecha de Reserva</label>
              <Input 
                id="edit-fechaReserva" 
                type="datetime-local"
                value={formData.fechaReserva ? formData.fechaReserva.slice(0, 16) : ""} 
                onChange={(e) => handleInputChange("fechaReserva", e.target.value + ":00")}
              />
            </div>
            <div>
              <label htmlFor="edit-asistencia" className="text-sm font-medium">Asistencia</label>
              <Select 
                value={formData.asistencia === null ? "null" : formData.asistencia.toString()} 
                onValueChange={(value) => handleInputChange("asistencia", value === "null" ? null : value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar asistencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Pendiente</SelectItem>
                  <SelectItem value="true">Asistió</SelectItem>
                  <SelectItem value="false">No Asistió</SelectItem>
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
