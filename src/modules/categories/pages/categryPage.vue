<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";

// Icons
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FolderIcon,
} from "@heroicons/vue/24/outline";
import { SquarePen, Trash2, PackagePlus } from "lucide-vue-next";

// UI
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// API
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/modules/categories/services/categoryService";

import type { Category } from "@/modules/categories/types/category";

const SquarePenIcon = SquarePen;
const Trash2Icon = Trash2;

// ==========================
// STATE
// ==========================
const categories = ref<Category[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const searchQuery = ref("");
const itemsPerPage = ref(10);
const currentPage = ref(1);

const showCreateModal = ref(false);
const showEditModal = ref(false);

const currentEditing = ref<Category | null>(null);

// Create model
const newCategory = ref({
  name: "",
  active: true,
});

// Edit model
const editingCategory = ref({
  name: "",
  active: true,
});

// ✅ Image file + preview
const newImageFile = ref<File | null>(null);
const editImageFile = ref<File | null>(null);

const newImagePreview = ref<string | null>(null);
const editImagePreview = ref<string | null>(null);

function onNewImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null;
  newImageFile.value = file;
  newImagePreview.value = file ? URL.createObjectURL(file) : null;
}

function onEditImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null;
  editImageFile.value = file;

  // if user selects new file -> preview it
  if (file) {
    editImagePreview.value = URL.createObjectURL(file);
  } else {
    // fallback to existing image_url
    editImagePreview.value = currentEditing.value?.image_url ?? null;
  }
}

// ==========================
// FILTERING
// ==========================
const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return categories.value
      .filter((c) => c.name.toLowerCase().includes(q))
      .sort((a, b) => a.id - b.id);
});

// ==========================
// PAGINATION
// ==========================
const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredCategories.value.slice(start, start + itemsPerPage.value);
});

// ==========================
// LOAD DATA
// ==========================
async function loadData() {
  loading.value = true;
  error.value = null;

  try {
    categories.value = await fetchCategories();
  } catch (err) {
    error.value = "Failed to load categories.";
  } finally {
    loading.value = false;
  }
}

// ==========================
// CREATE CATEGORY
// ==========================
function openCreateModal() {
  newCategory.value = { name: "", active: true };
  newImageFile.value = null;
  newImagePreview.value = null;
  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
}

async function handleCreate() {
  if (!newCategory.value.name.trim()) {
    Swal.fire("Validation", "Category name is required", "warning");
    return;
  }

  try {
    const created = await createCategory({
      name: newCategory.value.name,
      active: newCategory.value.active,
      imageFile: newImageFile.value,
    });

    categories.value.unshift(created);

    Swal.fire({
      icon: "success",
      title: "Category created",
      timer: 1500,
      showConfirmButton: false,
    });

    closeCreateModal();
    currentPage.value = 1;
  } catch {
    Swal.fire("Error", "Failed to create category", "error");
  }
}

// ==========================
// EDIT CATEGORY
// ==========================
function openEditModal(category: Category) {
  currentEditing.value = category;
  editingCategory.value = {
    name: category.name,
    active: category.active,
  };

  editImageFile.value = null;
  editImagePreview.value = category.image_url ?? null;

  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  currentEditing.value = null;
  editImageFile.value = null;
  editImagePreview.value = null;
}

async function handleUpdate() {
  if (!currentEditing.value) return;

  if (!editingCategory.value.name.trim()) {
    Swal.fire("Validation", "Category name is required", "warning");
    return;
  }

  try {
    const updated = await updateCategory(currentEditing.value.id, {
      name: editingCategory.value.name,
      active: editingCategory.value.active,
      imageFile: editImageFile.value,
    });

    const index = categories.value.findIndex(
        (c) => c.id === currentEditing.value?.id
    );
    if (index !== -1) categories.value.splice(index, 1, updated);

    Swal.fire({
      icon: "success",
      title: "Category updated",
      timer: 1500,
      showConfirmButton: false,
    });

    closeEditModal();
  } catch {
    Swal.fire("Error", "Failed to update category", "error");
  }
}

// ==========================
// DELETE CATEGORY
// ==========================
async function confirmDelete(category: Category) {
  const confirm = await Swal.fire({
    title: "Delete category?",
    text: `Category "${category.name}" will be removed.`,
    icon: "warning",
    showCancelButton: true,
  });

  if (!confirm.isConfirmed) return;

  try {
    await deleteCategory(category.id);
    categories.value = categories.value.filter((c) => c.id !== category.id);

    Swal.fire("Deleted!", "Category removed.", "success");

    if (paginatedCategories.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch {
    Swal.fire("Error", "Failed to delete category", "error");
  }
}

onMounted(() => loadData());
</script>

<template>
  <div class="p-3 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold">Category Management</h1>
      <p class="text-gray-500">Manage product categories</p>
    </div>

    <!-- Search + Add -->
    <div class="flex justify-between items-center">
      <div class="relative w-72">
        <Input
            v-model="searchQuery"
            placeholder="Search category..."
            @input="currentPage = 1"
            class="pl-10"
        />
        <MagnifyingGlassIcon
            class="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
        />
      </div>

      <Button @click="openCreateModal">
        <PackagePlus class="w-4 h-4 mr-2" />
        New Category
      </Button>
    </div>

    <!-- Error message -->
    <div v-if="error" class="p-3 rounded bg-red-50 text-red-600 border border-red-200">
      {{ error }}
    </div>

    <!-- TABLE -->
    <div
        class="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            ID
          </th>
          <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            IMAGE
          </th>
          <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            NAME
          </th>
          <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            STATUS
          </th>
          <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            ACTIONS
          </th>
        </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-if="loading">
          <td colspan="5" class="p-6 text-center">
            <ArrowPathIcon class="animate-spin h-5 w-5 mx-auto" />
          </td>
        </tr>

        <tr v-else-if="filteredCategories.length === 0">
          <td colspan="5" class="p-6 text-center">
            <FolderIcon class="h-10 w-10 mx-auto opacity-40" />
            <p>No categories found</p>
          </td>
        </tr>

        <tr
            v-for="(category, index) in paginatedCategories"
            :key="category.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <td class="px-6 py-3">
            {{ index + 1 + (currentPage - 1) * itemsPerPage }}
          </td>

          <td class="px-6 py-3">
            <img
                v-if="category.image_url"
                :src="category.image_url"
                class="h-10 w-10 rounded object-cover border"
                alt="category"
            />
            <span v-else class="text-xs text-gray-400">No image</span>
          </td>

          <td class="px-6 py-3">
            {{ category.name }}
          </td>

          <td class="px-6 py-3">
              <span
                  :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200': category.active,
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200': !category.active,
                }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ category.active ? "Active" : "Inactive" }}
              </span>
          </td>

          <td class="px-6 py-4 text-right space-x-2">
            <button
                @click="openEditModal(category)"
                class="inline-flex items-center px-3 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors duration-200"
            >
              <SquarePenIcon class="h-4 w-4 mr-1" />
              Edit
            </button>

            <button
                @click="confirmDelete(category)"
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
            :total="filteredCategories.length"
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
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Name</Label>
            <Input v-model="newCategory.name" class="col-span-3" />
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
            <select v-model="newCategory.active" class="col-span-3 border rounded px-3 py-2">
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
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Name</Label>
            <Input v-model="editingCategory.name" class="col-span-3" />
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
            <select v-model="editingCategory.active" class="col-span-3 border rounded px-3 py-2">
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
