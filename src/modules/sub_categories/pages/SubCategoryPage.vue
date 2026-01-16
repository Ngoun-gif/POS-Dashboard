<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import Swal from "sweetalert2"

// Icons
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FolderIcon,
} from "@heroicons/vue/24/outline"
import { SquarePen, Trash2, PackagePlus } from "lucide-vue-next"

// UI
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// API
import { fetchCategories } from "@/modules/categories/services/categoryService.ts"
import {
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "@/modules/sub_categories/services/SubCategoryService.ts"

import type { Category } from "@/modules/categories/types/category"
import type { SubCategory } from "@/modules/sub_categories/types/subcategory"

const SquarePenIcon = SquarePen
const Trash2Icon = Trash2

// ==========================
// STATE
// ==========================
const categories = ref<Category[]>([])

const subCategories = ref<SubCategory[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const searchQuery = ref("")
const itemsPerPage = ref(10)
const currentPage = ref(1)

const showCreateModal = ref(false)
const showEditModal = ref(false)

const currentEditing = ref<SubCategory | null>(null)

// Create model
const newSubCategory = ref({
  category_id: 0,
  name: "",
  active: true,
})

// Edit model
const editingSubCategory = ref({
  category_id: 0,
  name: "",
  active: true,
})

// ✅ Image file + preview
const newImageFile = ref<File | null>(null)
const editImageFile = ref<File | null>(null)

const newImagePreview = ref<string | null>(null)
const editImagePreview = ref<string | null>(null)

function onNewImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  newImageFile.value = file
  newImagePreview.value = file ? URL.createObjectURL(file) : null
}

function onEditImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  editImageFile.value = file

  if (file) {
    editImagePreview.value = URL.createObjectURL(file)
  } else {
    editImagePreview.value = currentEditing.value?.image_url ?? null
  }
}

// ==========================
// FILTERING
// ==========================
const filteredSubCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return subCategories.value
      .filter((s) => s.name.toLowerCase().includes(q))
      .sort((a, b) => a.id - b.id)
})

// ==========================
// PAGINATION
// ==========================
const paginatedSubCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredSubCategories.value.slice(start, start + itemsPerPage.value)
})

// Helper: category name
const categoryNameById = computed(() => {
  const map = new Map<number, string>()
  categories.value.forEach((c) => map.set(c.id, c.name))
  return map
})
function getCategoryName(category_id: number) {
  return categoryNameById.value.get(category_id) ?? `#${category_id}`
}

// ==========================
// LOAD DATA
// ==========================
async function loadData() {
  loading.value = true
  error.value = null

  try {
    // load category options + subcategories list
    categories.value = await fetchCategories()
    subCategories.value = await fetchSubCategories()

    // default category_id for create
    if (categories.value.length && newSubCategory.value.category_id === 0) {
      newSubCategory.value.category_id = categories.value[0].id
    }
  } catch (err) {
    error.value = "Failed to load sub-categories."
  } finally {
    loading.value = false
  }
}

// ==========================
// CREATE
// ==========================
function openCreateModal() {
  newSubCategory.value = {
    category_id: categories.value[0]?.id ?? 0,
    name: "",
    active: true,
  }
  newImageFile.value = null
  newImagePreview.value = null
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

async function handleCreate() {
  if (!newSubCategory.value.name.trim()) {
    Swal.fire("Validation", "Sub-category name is required", "warning")
    return
  }
  if (!newSubCategory.value.category_id) {
    Swal.fire("Validation", "Please select a category", "warning")
    return
  }

  try {
    const created = await createSubCategory({
      category_id: newSubCategory.value.category_id,
      name: newSubCategory.value.name,
      active: newSubCategory.value.active,
      imageFile: newImageFile.value,
    })

    subCategories.value.unshift(created)

    Swal.fire({
      icon: "success",
      title: "Sub-category created",
      timer: 1500,
      showConfirmButton: false,
    })

    closeCreateModal()
    currentPage.value = 1
  } catch (e: any) {
    Swal.fire("Error", e?.response?.data?.message || "Failed to create sub-category", "error")
  }
}

// ==========================
// EDIT
// ==========================
function openEditModal(item: SubCategory) {
  currentEditing.value = item
  editingSubCategory.value = {
    category_id: item.category_id,
    name: item.name,
    active: item.active,
  }

  editImageFile.value = null
  editImagePreview.value = item.image_url ?? null

  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  currentEditing.value = null
  editImageFile.value = null
  editImagePreview.value = null
}

async function handleUpdate() {
  if (!currentEditing.value) return
  if (!editingSubCategory.value.name.trim()) {
    Swal.fire("Validation", "Sub-category name is required", "warning")
    return
  }
  if (!editingSubCategory.value.category_id) {
    Swal.fire("Validation", "Please select a category", "warning")
    return
  }

  try {
    const updated = await updateSubCategory(currentEditing.value.id, {
      category_id: editingSubCategory.value.category_id,
      name: editingSubCategory.value.name,
      active: editingSubCategory.value.active,
      imageFile: editImageFile.value,
    })

    const index = subCategories.value.findIndex((s) => s.id === currentEditing.value?.id)
    if (index !== -1) subCategories.value.splice(index, 1, updated)

    Swal.fire({
      icon: "success",
      title: "Sub-category updated",
      timer: 1500,
      showConfirmButton: false,
    })

    closeEditModal()
  } catch (e: any) {
    Swal.fire("Error", e?.response?.data?.message || "Failed to update sub-category", "error")
  }
}

// ==========================
// DELETE
// ==========================
async function confirmDelete(item: SubCategory) {
  const confirm = await Swal.fire({
    title: "Delete sub-category?",
    text: `Sub-category "${item.name}" will be removed.`,
    icon: "warning",
    showCancelButton: true,
  })

  if (!confirm.isConfirmed) return

  try {
    await deleteSubCategory(item.id)
    subCategories.value = subCategories.value.filter((s) => s.id !== item.id)

    Swal.fire("Deleted!", "Sub-category removed.", "success")

    if (paginatedSubCategories.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (e: any) {
    Swal.fire("Error", e?.response?.data?.message || "Failed to delete sub-category", "error")
  }
}

onMounted(() => loadData())
</script>

<template>
  <div class="p-3 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold">Sub-Category Management</h1>
      <p class="text-gray-500">Manage sub-categories under categories</p>
    </div>

    <!-- Search + Add -->
    <div class="flex justify-between items-center">
      <div class="relative w-72">
        <Input
            v-model="searchQuery"
            placeholder="Search sub-category..."
            @input="currentPage = 1"
            class="pl-10"
        />
        <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
      </div>

      <Button @click="openCreateModal" :disabled="categories.length === 0">
        <PackagePlus class="w-4 h-4 mr-2" />
        New Sub-Category
      </Button>
    </div>

    <div v-if="error" class="p-3 rounded bg-red-50 text-red-600 border border-red-200">
      {{ error }}
    </div>

    <!-- TABLE -->
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IMAGE</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">NAME</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CATEGORY</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">STATUS</th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ACTIONS</th>
        </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-if="loading">
          <td colspan="6" class="p-6 text-center">
            <ArrowPathIcon class="animate-spin h-5 w-5 mx-auto" />
          </td>
        </tr>

        <tr v-else-if="filteredSubCategories.length === 0">
          <td colspan="6" class="p-6 text-center">
            <FolderIcon class="h-10 w-10 mx-auto opacity-40" />
            <p>No sub-categories found</p>
          </td>
        </tr>

        <tr
            v-for="(item, index) in paginatedSubCategories"
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <td class="px-6 py-3">
            {{ index + 1 + (currentPage - 1) * itemsPerPage }}
          </td>

          <td class="px-6 py-3">
            <img
                v-if="item.image_url"
                :src="item.image_url"
                class="h-10 w-10 rounded object-cover border"
                alt="sub-category"
            />
            <span v-else class="text-xs text-gray-400">No image</span>
          </td>

          <td class="px-6 py-3">
            {{ item.name }}
          </td>

          <td class="px-6 py-3">
            {{ getCategoryName(item.category_id) }}
          </td>

          <td class="px-6 py-3">
              <span
                  :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200': item.active,
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200': !item.active,
                }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ item.active ? "Active" : "Inactive" }}
              </span>
          </td>

          <td class="px-6 py-4 text-right space-x-2">
            <button
                @click="openEditModal(item)"
                class="inline-flex items-center px-3 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors duration-200"
            >
              <SquarePenIcon class="h-4 w-4 mr-1" />
              Edit
            </button>

            <button
                @click="confirmDelete(item)"
                class="inline-flex items-center px-3 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200"
            >
              <Trash2Icon class="h-4 w-4 mr-1" />
              Delete
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <Pagination
            :items-per-page="itemsPerPage"
            :total="filteredSubCategories.length"
            :default-page="currentPage"
            @update:page="currentPage = $event"
            v-slot="{ page }"
        >
          <PaginationContent v-slot="{ items }" class="flex gap-1">
            <PaginationPrevious />

            <template v-for="(item, index) in items" :key="index">
              <PaginationItem
                  v-if="item.type === 'page'"
                  :value="item.value"
                  :is-active="item.value === currentPage"
                  @click="currentPage = item.value"
              >
                {{ item.value }}
              </PaginationItem>
            </template>

            <PaginationEllipsis />
            <PaginationNext />
          </PaginationContent>
        </Pagination>
      </div>
    </div>

    <!-- CREATE MODAL -->
    <Dialog :open="showCreateModal" @update:open="(val) => !val && closeCreateModal()">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Sub-Category</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Category</Label>
            <select v-model="newSubCategory.category_id" class="col-span-3 border rounded px-3 py-2">
              <option v-for="c in categories" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Name</Label>
            <Input v-model="newSubCategory.name" class="col-span-3" />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Image</Label>
            <div class="col-span-3 space-y-2">
              <Input type="file" accept="image/*" @change="onNewImageChange" />
              <img v-if="newImagePreview" :src="newImagePreview" class="h-20 w-20 rounded object-cover border" />
            </div>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Active</Label>
            <select v-model="newSubCategory.active" class="col-span-3 border rounded px-3 py-2">
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeCreateModal">Cancel</Button>
          <Button @click="handleCreate">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- EDIT MODAL -->
    <Dialog :open="showEditModal" @update:open="(val) => !val && closeEditModal()">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Sub-Category</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Category</Label>
            <select v-model="editingSubCategory.category_id" class="col-span-3 border rounded px-3 py-2">
              <option v-for="c in categories" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Name</Label>
            <Input v-model="editingSubCategory.name" class="col-span-3" />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Image</Label>
            <div class="col-span-3 space-y-2">
              <Input type="file" accept="image/*" @change="onEditImageChange" />
              <img v-if="editImagePreview" :src="editImagePreview" class="h-20 w-20 rounded object-cover border" />
            </div>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Active</Label>
            <select v-model="editingSubCategory.active" class="col-span-3 border rounded px-3 py-2">
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeEditModal">Cancel</Button>
          <Button @click="handleUpdate">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
