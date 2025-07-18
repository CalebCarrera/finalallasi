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
  Dumbbell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Entrenamiento } from "@/services/types/Entrenamiento"
import { getEntrenamientos, postEntrenamiento, putEntrenamiento, deleteEntrenamiento } from "@/services/api/entrenamiento"

// Tipo para el formulario de entrenamiento
type EntrenamientoFormData = Omit<Entrenamiento, "entrenamientoId">;

export default function EntrenamientoPage() {
  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Entrenamiento>("entrenamientoId")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editModal, setEditModal] = useState({ open: false, id: 0 })
  const [deleteModal, setDeleteModal] = useState({ open: false, id: 0, name: "" })

  const pageSize = 10

  const [formData, setFormData] = useState<EntrenamientoFormData>({
    tipo: "",
    fecha: new Date().toISOString().split("T")[0],
    horaInicio: "08:00:00",
    horaFin: "09:00:00",
    local: {
      id: 1,
      nombre: "",
      direccion: "",
      tipo: "",
      capacidad: 50,
      estado: true
    },
    entrenador: {
      id: 1,
      nombres: "",
      apellidos: "",
      dni: "",
      correo: "",
      telefono: "",
      especialidad: "",
      estado: true
    },
    maxParticipantes: 10,
    descripcion: "",
    informe: ""
  })

  // Cargar entrenamientos al montar el componente
  useEffect(() => {
    loadEntrenamientos()
  }, [])

  const loadEntrenamientos = async () => {
    setLoading(true)
    try {
      const data = await getEntrenamientos()
      setEntrenamientos(data)
    } catch (error) {
      console.error("Error loading entrenamientos:", error)
    }
    setLoading(false)
  }

  // Filtrar y ordenar entrenamientos
  const filtered = useMemo(() => {
    return entrenamientos.filter((e) => {
      const searchTerm = search.toLowerCase()
      return (
        (e.descripcion?.toLowerCase().includes(searchTerm) || false) ||
        (e.tipo?.toLowerCase().includes(searchTerm) || false) ||
        (e.entrenador?.id?.toString().includes(searchTerm) || false)
      )
    })
  }, [entrenamientos, search])

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
  const handleSort = (field: keyof Entrenamiento) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: keyof Entrenamiento) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? " ↑" : " ↓"
  }

  const handleInputChange = (field: keyof EntrenamientoFormData, value: string | number | any) => {
    setFormData((prev: EntrenamientoFormData) => ({ ...prev, [field]: value }))
  }

  const handleEntrenadorChange = (entrenadorId: number) => {
    setFormData((prev: EntrenamientoFormData) => ({
      ...prev,
      entrenador: { 
        id: entrenadorId,
        nombres: "",
        apellidos: "",
        dni: "",
        correo: "",
        telefono: "",
        especialidad: "",
        estado: true
      }
    }))
  }

  const handleLocalChange = (localId: number) => {
    setFormData((prev: EntrenamientoFormData) => ({
      ...prev,
      local: { 
        id: localId,
        nombre: "",
        direccion: "",
        tipo: "",
        capacidad: 50,
        estado: true
      }
    }))
  }

  const resetForm = () => {
    setFormData({
      tipo: "",
      fecha: new Date().toISOString().split("T")[0],
      horaInicio: "08:00:00",
      horaFin: "09:00:00",
      local: {
        id: 1,
        nombre: "",
        direccion: "",
        tipo: "",
        capacidad: 50,
        estado: true
      },
      entrenador: {
        id: 1,
        nombres: "",
        apellidos: "",
        dni: "",
        correo: "",
        telefono: "",
        especialidad: "",
        estado: true
      },
      maxParticipantes: 10,
      descripcion: "",
      informe: ""
    })
  }

  const handleAddEntrenamiento = async () => {
    if (!formData.tipo || !formData.fecha || !formData.horaInicio || !formData.horaFin || !formData.entrenador?.id || !formData.local?.id) {
      alert("Por favor completa los campos obligatorios")
      return
    }
    setLoading(true)
    
    // Preparar datos para el backend - enviar entrenadorId y localId como campos directos
    const dataToSend = {
      ...formData,
      entrenadorId: formData.entrenador.id,
      localId: formData.local.id
    }
    
    const result = await postEntrenamiento(dataToSend)
    if (result) {
      setEntrenamientos(prev => [...prev, result])
      setShowAdd(false)
      resetForm()
    } else {
      alert("Error al guardar el entrenamiento")
    }
    setLoading(false)
  }

  const openEditModal = (id: number) => {
    const entrenamiento = entrenamientos.find(e => e.entrenamientoId === id)
    if (entrenamiento) {
      setFormData({
        tipo: entrenamiento.tipo || "",
        fecha: entrenamiento.fecha,
        horaInicio: entrenamiento.horaInicio,
        horaFin: entrenamiento.horaFin,
        local: entrenamiento.local || { 
          id: 1,
          nombre: "",
          direccion: "",
          tipo: "",
          capacidad: 50,
          estado: true
        },
        entrenador: entrenamiento.entrenador || { 
          id: 1,
          nombres: "",
          apellidos: "",
          dni: "",
          correo: "",
          telefono: "",
          especialidad: "",
          estado: true
        },
        maxParticipantes: entrenamiento.maxParticipantes || 10,
        descripcion: entrenamiento.descripcion || "",
        informe: entrenamiento.informe || ""
      })
      setEditModal({ open: true, id })
    }
  }

  const handleEditSave = async () => {
    if (!formData.tipo || !formData.fecha || !formData.horaInicio || !formData.horaFin || !formData.entrenador?.id || !formData.local?.id) {
      alert("Por favor completa los campos obligatorios")
      return
    }
    setLoading(true)
    
    // Preparar datos para el backend - enviar entrenadorId y localId como campos directos
    const dataToSend = {
      ...formData,
      entrenamientoId: editModal.id,
      entrenadorId: formData.entrenador.id,
      localId: formData.local.id
    }
    
    const result = await putEntrenamiento(dataToSend)
    if (result) {
      setEntrenamientos(prev =>
        prev.map(e => e.entrenamientoId === result.entrenamientoId ? result : e)
      )
      setEditModal({ open: false, id: 0 })
      resetForm()
    } else {
      alert("Error al actualizar el entrenamiento")
    }
    setLoading(false)
  }

  const openDeleteModal = (id: number) => {
    const entrenamiento = entrenamientos.find(e => e.entrenamientoId === id)
    if (entrenamiento) {
      setDeleteModal({ 
        open: true, 
        id, 
        name: entrenamiento.descripcion || "Entrenamiento" 
      })
    }
  }

  const handleDelete = async (id: number) => {
    setLoading(true)
    const success = await deleteEntrenamiento(id)
    if (success) {
      setEntrenamientos(prev => prev.filter(e => e.entrenamientoId !== id))
      setDeleteModal({ open: false, id: 0, name: "" })
    } else {
      alert("Error al eliminar el entrenamiento")
    }
    setLoading(false)
  }

  const toggleEntrenamientoStatus = async (id: number) => {
    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500))

    setEntrenamientos(prev => 
      prev.map(e => 
        e.entrenamientoId === id
          ? { ...e, descripcion: e.descripcion + " (Inactivo)" }
          : e
      )
    )
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Entrenamientos</h1>
          <p className="text-muted-foreground">Gestiona las clases y sesiones de entrenamiento</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <Dumbbell className="w-4 h-4 mr-1" />
          {filtered.length} entrenamiento{filtered.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar entrenamiento..."
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
                  Agregar Entrenamiento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Agregar entrenamiento</DialogTitle>
                  <DialogDescription>Completa la información del nuevo entrenamiento</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <label htmlFor="descripcion" className="text-sm font-medium">Descripción</label>
                    <Input 
                      id="descripcion" 
                      value={formData.descripcion} 
                      onChange={(e) => handleInputChange("descripcion", e.target.value)}
                      placeholder="Entrenamiento de fuerza para principiantes"
                    />
                  </div>
                  <div>
                    <label htmlFor="tipo" className="text-sm font-medium">Tipo</label>
                    <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Grupal">Grupal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="entrenador" className="text-sm font-medium">Entrenador ID</label>
                    <Input 
                      id="entrenador" 
                      type="number"
                      value={formData.entrenador?.id || 1} 
                      onChange={(e) => handleEntrenadorChange(parseInt(e.target.value) || 1)}
                      min="1"
                      placeholder="ID del entrenador"
                    />
                  </div>
                  <div>
                    <label htmlFor="local" className="text-sm font-medium">Local ID</label>
                    <Input 
                      id="local" 
                      type="number"
                      value={formData.local?.id || 1} 
                      onChange={(e) => handleLocalChange(parseInt(e.target.value) || 1)}
                      min="1"
                      placeholder="ID del local"
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
                      <label htmlFor="maxParticipantes" className="text-sm font-medium">Max Participantes</label>
                      <Input 
                        id="maxParticipantes" 
                        type="number"
                        value={formData.maxParticipantes} 
                        onChange={(e) => handleInputChange("maxParticipantes", parseInt(e.target.value) || 10)}
                        min="1"
                        max="50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="horaInicio" className="text-sm font-medium">Hora Inicio</label>
                      <Input 
                        id="horaInicio" 
                        type="time"
                        value={formData.horaInicio} 
                        onChange={(e) => handleInputChange("horaInicio", e.target.value + ":00")}
                      />
                    </div>
                    <div>
                      <label htmlFor="horaFin" className="text-sm font-medium">Hora Fin</label>
                      <Input 
                        id="horaFin" 
                        type="time"
                        value={formData.horaFin} 
                        onChange={(e) => handleInputChange("horaFin", e.target.value + ":00")}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="informe" className="text-sm font-medium">Informe</label>
                    <Input 
                      id="informe" 
                      value={formData.informe || ""} 
                      onChange={(e) => handleInputChange("informe", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddEntrenamiento} disabled={loading} className="flex-1">
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
                    onClick={() => handleSort("entrenamientoId")}
                  >
                    <div className="flex items-center">
                      ID
                      {getSortIcon("entrenamientoId")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("descripcion")}
                  >
                    <div className="flex items-center">
                      Descripción
                      {getSortIcon("descripcion")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-32 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("tipo")}
                  >
                    <div className="flex items-center">
                      Tipo
                      {getSortIcon("tipo")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-24 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("fecha")}
                  >
                    <div className="flex items-center">
                      Fecha
                      {getSortIcon("fecha")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-28 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("horaInicio")}
                  >
                    <div className="flex items-center">
                      Hora Inicio
                      {getSortIcon("horaInicio")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-24 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("horaFin")}
                  >
                    <div className="flex items-center">
                      Hora Fin
                      {getSortIcon("horaFin")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-24 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("maxParticipantes")}
                  >
                    <div className="flex items-center">
                      Max Part.
                      {getSortIcon("maxParticipantes")}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">Entrenador</TableHead>
                  <TableHead className="font-semibold">Local</TableHead>
                  <TableHead className="w-32 text-center font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((e) => (
                  <TableRow key={e.entrenamientoId} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-muted-foreground">
                      #{e.entrenamientoId?.toString().padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{e.descripcion}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{e.tipo}</Badge>
                    </TableCell>
                    <TableCell>{e.fecha}</TableCell>
                    <TableCell>{e.horaInicio}</TableCell>
                    <TableCell>{e.horaFin}</TableCell>
                    <TableCell>{e.maxParticipantes}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.entrenador ? `${e.entrenador.nombres} ${e.entrenador.apellidos}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.local ? e.local.nombre : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditModal(e.entrenamientoId || 0)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleEntrenamientoStatus(e.entrenamientoId || 0)} className="cursor-pointer">
                            {e.descripcion?.includes("Inactivo") ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activar
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Desactivar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteModal(e.entrenamientoId || 0)}
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
                        <Dumbbell className="w-8 h-8" />
                        <p className="text-sm">No se encontraron entrenamientos</p>
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
                entrenamiento{sorted.length !== 1 ? "s" : ""}
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
              ¿Estás seguro de que deseas eliminar el entrenamiento {deleteModal.name}? Esta acción no se puede deshacer.
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
            <DialogTitle>Editar entrenamiento</DialogTitle>
            <DialogDescription>Modifica la información del entrenamiento.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="edit-descripcion" className="text-sm font-medium">Descripción</label>
              <Input 
                id="edit-descripcion" 
                value={formData.descripcion} 
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
              />
            </div>
                          <div>
                <label htmlFor="edit-tipo" className="text-sm font-medium">Tipo</label>
                <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Grupal">Grupal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="edit-entrenador" className="text-sm font-medium">Entrenador ID</label>
                <Input 
                  id="edit-entrenador" 
                  type="number"
                  value={formData.entrenador?.id || 1} 
                  onChange={(e) => handleEntrenadorChange(parseInt(e.target.value) || 1)}
                  min="1"
                  placeholder="ID del entrenador"
                />
              </div>
              <div>
                <label htmlFor="edit-local" className="text-sm font-medium">Local ID</label>
                <Input 
                  id="edit-local" 
                  type="number"
                  value={formData.local?.id || 1} 
                  onChange={(e) => handleLocalChange(parseInt(e.target.value) || 1)}
                  min="1"
                  placeholder="ID del local"
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
                <label htmlFor="edit-maxParticipantes" className="text-sm font-medium">Max Participantes</label>
                <Input 
                  id="edit-maxParticipantes" 
                  type="number"
                  value={formData.maxParticipantes} 
                  onChange={(e) => handleInputChange("maxParticipantes", parseInt(e.target.value) || 10)}
                  min="1"
                  max="50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-horaInicio" className="text-sm font-medium">Hora Inicio</label>
                <Input 
                  id="edit-horaInicio" 
                  type="time"
                  value={formData.horaInicio} 
                  onChange={(e) => handleInputChange("horaInicio", e.target.value + ":00")}
                />
              </div>
              <div>
                <label htmlFor="edit-horaFin" className="text-sm font-medium">Hora Fin</label>
                <Input 
                  id="edit-horaFin" 
                  type="time"
                  value={formData.horaFin} 
                  onChange={(e) => handleInputChange("horaFin", e.target.value + ":00")}
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-informe" className="text-sm font-medium">Informe</label>
              <Input 
                id="edit-informe" 
                value={formData.informe || ""} 
                onChange={(e) => handleInputChange("informe", e.target.value)}
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
