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
import { Entrenamiento, EntrenamientoFormData } from "@/services/types/Entrenamiento"

// Datos de ejemplo para entrenamientos
const entrenamientosData: Entrenamiento[] = [
  {
    id: 1,
    nombre: "Musculación Básica",
    descripcion: "Entrenamiento de fuerza para principiantes",
    tipo: "Musculación",
    duracion: 60,
    nivel: "Principiante",
    capacidadMaxima: 15,
    precio: 25,
    entrenadorId: 1,
    entrenadorNombre: "Carlos García",
    active: true
  },
  {
    id: 2,
    nombre: "Yoga Flow",
    descripcion: "Sesión de yoga para flexibilidad y relajación",
    tipo: "Yoga",
    duracion: 90,
    nivel: "Intermedio",
    capacidadMaxima: 20,
    precio: 30,
    entrenadorId: 2,
    entrenadorNombre: "Ana Martínez",
    active: true
  },
  {
    id: 3,
    nombre: "CrossFit Intenso",
    descripcion: "Entrenamiento funcional de alta intensidad",
    tipo: "CrossFit",
    duracion: 45,
    nivel: "Avanzado",
    capacidadMaxima: 12,
    precio: 35,
    entrenadorId: 3,
    entrenadorNombre: "Luis Rodríguez",
    active: true
  },
  {
    id: 4,
    nombre: "Cardio Dance",
    descripcion: "Baile aeróbico para quemar calorías",
    tipo: "Cardio",
    duracion: 50,
    nivel: "Principiante",
    capacidadMaxima: 25,
    precio: 20,
    entrenadorId: 4,
    entrenadorNombre: "María López",
    active: false
  },
  {
    id: 5,
    nombre: "Spinning Pro",
    descripcion: "Ciclismo indoor de alta intensidad",
    tipo: "Spinning",
    duracion: 55,
    nivel: "Intermedio",
    capacidadMaxima: 18,
    precio: 28,
    entrenadorId: 5,
    entrenadorNombre: "Roberto Hernández",
    active: true
  }
]

export default function EntrenamientoPage() {
  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>(entrenamientosData)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Entrenamiento>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editModal, setEditModal] = useState({ open: false, id: 0 })
  const [deleteModal, setDeleteModal] = useState({ open: false, id: 0, name: "" })

  const pageSize = 10

  const [formData, setFormData] = useState<EntrenamientoFormData>({
    nombre: "",
    descripcion: "",
    tipo: "",
    duracion: 60,
    nivel: "Principiante",
    capacidadMaxima: 15,
    precio: 0,
    entrenadorId: 1
  })

  // Filtrar y ordenar entrenamientos
  const filtered = useMemo(() => {
    return entrenamientos.filter((e) => {
      const searchTerm = search.toLowerCase()
      return (
        e.nombre.toLowerCase().includes(searchTerm) ||
        e.descripcion.toLowerCase().includes(searchTerm) ||
        e.tipo.toLowerCase().includes(searchTerm) ||
        e.entrenadorNombre.toLowerCase().includes(searchTerm)
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

  const handleInputChange = (field: keyof EntrenamientoFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      tipo: "",
      duracion: 60,
      nivel: "Principiante",
      capacidadMaxima: 15,
      precio: 0,
      entrenadorId: 1
    })
  }

  const handleAddEntrenamiento = async () => {
    if (!formData.nombre || !formData.tipo || !formData.descripcion) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const entrenador = entrenamientos.find(e => e.entrenadorId === formData.entrenadorId)
    const newEntrenamiento: Entrenamiento = {
      id: Math.max(...entrenamientos.map(e => e.id)) + 1,
      ...formData,
      entrenadorNombre: entrenador?.entrenadorNombre || "Sin asignar",
      active: true
    }

    setEntrenamientos(prev => [...prev, newEntrenamiento])
    setShowAdd(false)
    resetForm()
    setLoading(false)
  }

  const openEditModal = (id: number) => {
    const entrenamiento = entrenamientos.find(e => e.id === id)
    if (entrenamiento) {
      setFormData({
        nombre: entrenamiento.nombre,
        descripcion: entrenamiento.descripcion,
        tipo: entrenamiento.tipo,
        duracion: entrenamiento.duracion,
        nivel: entrenamiento.nivel,
        capacidadMaxima: entrenamiento.capacidadMaxima,
        precio: entrenamiento.precio,
        entrenadorId: entrenamiento.entrenadorId
      })
      setEditModal({ open: true, id })
    }
  }

  const handleEditSave = async () => {
    if (!formData.nombre || !formData.tipo || !formData.descripcion) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const entrenador = entrenamientos.find(e => e.entrenadorId === formData.entrenadorId)
    setEntrenamientos(prev => 
      prev.map(e => 
        e.id === editModal.id 
          ? { ...e, ...formData, entrenadorNombre: entrenador?.entrenadorNombre || "Sin asignar" }
          : e
      )
    )
    setEditModal({ open: false, id: 0 })
    resetForm()
    setLoading(false)
  }

  const openDeleteModal = (id: number) => {
    const entrenamiento = entrenamientos.find(e => e.id === id)
    if (entrenamiento) {
      setDeleteModal({ 
        open: true, 
        id, 
        name: entrenamiento.nombre 
      })
    }
  }

  const handleDelete = async (id: number) => {
    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    setEntrenamientos(prev => prev.filter(e => e.id !== id))
    setDeleteModal({ open: false, id: 0, name: "" })
    setLoading(false)
  }

  const toggleEntrenamientoStatus = async (id: number) => {
    setLoading(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500))

    setEntrenamientos(prev => 
      prev.map(e => 
        e.id === id 
          ? { ...e, active: !e.active }
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
                    <label htmlFor="nombre" className="text-sm font-medium">Nombre</label>
                    <Input 
                      id="nombre" 
                      value={formData.nombre} 
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      placeholder="Musculación Básica"
                    />
                  </div>
                  <div>
                    <label htmlFor="descripcion" className="text-sm font-medium">Descripción</label>
                    <Input 
                      id="descripcion" 
                      value={formData.descripcion} 
                      onChange={(e) => handleInputChange("descripcion", e.target.value)}
                      placeholder="Entrenamiento de fuerza para principiantes"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="tipo" className="text-sm font-medium">Tipo</label>
                      <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Musculación">Musculación</SelectItem>
                          <SelectItem value="Cardio">Cardio</SelectItem>
                          <SelectItem value="Yoga">Yoga</SelectItem>
                          <SelectItem value="CrossFit">CrossFit</SelectItem>
                          <SelectItem value="Spinning">Spinning</SelectItem>
                          <SelectItem value="Pilates">Pilates</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="nivel" className="text-sm font-medium">Nivel</label>
                      <Select value={formData.nivel} onValueChange={(value) => handleInputChange("nivel", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Principiante">Principiante</SelectItem>
                          <SelectItem value="Intermedio">Intermedio</SelectItem>
                          <SelectItem value="Avanzado">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="duracion" className="text-sm font-medium">Duración (min)</label>
                      <Input 
                        id="duracion" 
                        type="number"
                        value={formData.duracion} 
                        onChange={(e) => handleInputChange("duracion", parseInt(e.target.value) || 60)}
                        min="15"
                        max="180"
                      />
                    </div>
                    <div>
                      <label htmlFor="capacidadMaxima" className="text-sm font-medium">Capacidad Máx.</label>
                      <Input 
                        id="capacidadMaxima" 
                        type="number"
                        value={formData.capacidadMaxima} 
                        onChange={(e) => handleInputChange("capacidadMaxima", parseInt(e.target.value) || 15)}
                        min="1"
                        max="50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
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
                    <div>
                      <label htmlFor="entrenadorId" className="text-sm font-medium">Entrenador ID</label>
                      <Input 
                        id="entrenadorId" 
                        type="number"
                        value={formData.entrenadorId} 
                        onChange={(e) => handleInputChange("entrenadorId", parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
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
                    onClick={() => handleSort("duracion")}
                  >
                    <div className="flex items-center">
                      Duración
                      {getSortIcon("duracion")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-28 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("nivel")}
                  >
                    <div className="flex items-center">
                      Nivel
                      {getSortIcon("nivel")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-24 font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("capacidadMaxima")}
                  >
                    <div className="flex items-center">
                      Capacidad
                      {getSortIcon("capacidadMaxima")}
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
                    className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => handleSort("entrenadorNombre")}
                  >
                    <div className="flex items-center">
                      Entrenador
                      {getSortIcon("entrenadorNombre")}
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
                    <TableCell className="font-medium">{e.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{e.tipo}</Badge>
                    </TableCell>
                    <TableCell>{e.duracion} min</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{e.nivel}</Badge>
                    </TableCell>
                    <TableCell>{e.capacidadMaxima}</TableCell>
                    <TableCell>S/ {e.precio}</TableCell>
                    <TableCell className="text-muted-foreground">{e.entrenadorNombre}</TableCell>
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
                          <DropdownMenuItem onClick={() => toggleEntrenamientoStatus(e.id)} className="cursor-pointer">
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
                    <TableCell colSpan={9} className="h-32 text-center">
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
              <label htmlFor="edit-nombre" className="text-sm font-medium">Nombre</label>
              <Input 
                id="edit-nombre" 
                value={formData.nombre} 
                onChange={(e) => handleInputChange("nombre", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="edit-descripcion" className="text-sm font-medium">Descripción</label>
              <Input 
                id="edit-descripcion" 
                value={formData.descripcion} 
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-tipo" className="text-sm font-medium">Tipo</label>
                <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Musculación">Musculación</SelectItem>
                    <SelectItem value="Cardio">Cardio</SelectItem>
                    <SelectItem value="Yoga">Yoga</SelectItem>
                    <SelectItem value="CrossFit">CrossFit</SelectItem>
                    <SelectItem value="Spinning">Spinning</SelectItem>
                    <SelectItem value="Pilates">Pilates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="edit-nivel" className="text-sm font-medium">Nivel</label>
                <Select value={formData.nivel} onValueChange={(value) => handleInputChange("nivel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Principiante">Principiante</SelectItem>
                    <SelectItem value="Intermedio">Intermedio</SelectItem>
                    <SelectItem value="Avanzado">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-duracion" className="text-sm font-medium">Duración (min)</label>
                <Input 
                  id="edit-duracion" 
                  type="number"
                  value={formData.duracion} 
                  onChange={(e) => handleInputChange("duracion", parseInt(e.target.value) || 60)}
                  min="15"
                  max="180"
                />
              </div>
              <div>
                <label htmlFor="edit-capacidadMaxima" className="text-sm font-medium">Capacidad Máx.</label>
                <Input 
                  id="edit-capacidadMaxima" 
                  type="number"
                  value={formData.capacidadMaxima} 
                  onChange={(e) => handleInputChange("capacidadMaxima", parseInt(e.target.value) || 15)}
                  min="1"
                  max="50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
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
              <div>
                <label htmlFor="edit-entrenadorId" className="text-sm font-medium">Entrenador ID</label>
                <Input 
                  id="edit-entrenadorId" 
                  type="number"
                  value={formData.entrenadorId} 
                  onChange={(e) => handleInputChange("entrenadorId", parseInt(e.target.value) || 1)}
                  min="1"
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
