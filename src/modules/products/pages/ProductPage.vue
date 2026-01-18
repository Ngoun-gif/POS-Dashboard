<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
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
import { fetchCategories } from "@/modules/categories/services/categoryService";
import { fetchSubCategories } from "@/modules/sub_categories/services/SubCategoryService";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/modules/products/services/productService";

// Types
import type { Category } from "@/modules/categories/types/category";
import type { Subcategory } from "@/modules/sub_categories/types/Subcategory";
import type { Product } from "@/modules/products/types/product";

const SquarePenIcon = SquarePen;
const Trash2Icon = Trash2;

// ==========================
// STATE
// ==========================
const categories = ref<Category[]>([]);
const subCategories = ref<Subcategory[]>([]);

const products = ref<Product[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const searchQuery = ref("");
const itemsPerPage = ref(10);
const currentPage = ref(1);

// Filters
const selectedCategoryId = ref<number>(0);
const selectedSubCategoryId = ref<number>(0);

// Modals
const showCreateModal = ref(false);
const showEditModal = ref(false);

const currentEditing = ref<Product | null>(null);

// Create model
const newProduct = ref({
  category_id: 0,        // only for UI filter
  sub_category_id: 0,
  name: "",
  description: "",
  active: true,
});

// Edit model
const editingProduct = ref({
  category_id: 0,        // only for UI filter
  sub_category_id: 0,
  name: "",
  description: "",
  active: true,
});

// Thumbnail file + preview
const newThumbFile = ref<File | null>(null);
const editThumbFile = ref<File | null>(null);

const newThumbPreview = ref<string | null>(null);
const editThumbPreview = ref<string | null>(null);

function onNewThumbChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null;
  newThumbFile.value = file;
  newThumbPreview.value = file ? URL.createObjectURL(file) : null;
}

function onEditThumbChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null;
  editThumbFile.value = file;

  if (file) editThumbPreview.value = URL.createObjectURL(file);
  else editThumbPreview.value = currentEditing.value?.thumbnail_url ?? null;
}

// ==========================
// DEPENDENT DROPDOWNS
// ==========================
const filteredSubCategoriesByCategory = computed(() => {
  if (!selectedCategoryId.value) return subCategories.value;
  return subCategories.value.filter((s) => s.category_id === selectedCategoryId.value);
});

const createSubCategoriesByCategory = computed(() => {
  if (!newProduct.value.category_id) return subCategories.value;
  return subCategories.value.filter((s) => s.category_id === newProduct.value.category_id);
});

const editSubCategoriesByCategory = computed(() => {
  if (!editingProduct.value.category_id) return subCategories.value;
  return subCategories.value.filter((s) => s.category_id === editingProduct.value.category_id);
});

// ==========================
// FILTERING (frontend + backend query)
// ==========================
const filteredProducts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return products.value
      .filter((p) => p.name.toLowerCase().includes(q))
      .sort((a, b) => a.id - b.id);
});

// ==========================
// PAGINATION (frontend)
// ==========================
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredProducts.value.slice(start, start + itemsPerPage.value);
});

// Helpers
const categoryNameById = computed(() => {
  const map = new Map<number, string>();
  categories.value.forEach((c) => map.set(c.id, c.name));
  return map;
});
const subCategoryNameById = computed(() => {
  const map = new Map<number, string>();
  subCategories.value.forEach((s) => map.set(s.id, s.name));
  return map;
});
function getCategoryName(id: number) {
  return categoryNameById.value.get(id) ?? `#${id}`;
}
function getSubCategoryName(id: number) {
  return subCategoryNameById.value.get(id) ?? `#${id}`;
}

// ==========================
// LOAD DATA
// ==========================
async function loadLookups() {
  categories.value = await fetchCategories();
  subCategories.value = await fetchSubCategories();

  // default filter values
  if (categories.value.length && selectedCategoryId.value === 0) {
    selectedCategoryId.value = categories.value[0].id;
  }

  // ensure selected subcategory belongs to selected category
  const subs = filteredSubCategoriesByCategory.value;
  if (subs.length && selectedSubCategoryId.value === 0) {
    selectedSubCategoryId.value = subs[0].id;
  }
}

async function loadProducts() {
  loading.value = true;
  error.value = null;

  try {
    // backend supports sub_category_id filter
    const subId = selectedSubCategoryId.value || undefined;
    products.value = await fetchProducts({ sub_category_id: subId });
  } catch {
    error.value = "Failed to load products.";
  } finally {
    loading.value = false;
  }
}

// refresh subcategory when category changes (filter)
watch(selectedCategoryId, () => {
  const subs = filteredSubCategoriesByCategory.value;
  selectedSubCategoryId.value = subs[0]?.id ?? 0;
});

// reload products when subcategory filter changes
watch(selectedSubCategoryId, async () => {
  currentPage.value = 1;
  await loadProducts();
});

// ==========================
// CREATE
// ==========================
function openCreateModal() {
  newProduct.value = {
    category_id: categories.value[0]?.id ?? 0,
    sub_category_id: 0,
    name: "",
    description: "",
    active: true,
  };

  const subs = createSubCategoriesByCategory.value;
  newProduct.value.sub_category_id = subs[0]?.id ?? 0;

  newThumbFile.value = null;
  newThumbPreview.value = null;

  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
}

watch(
    () => newProduct.value.category_id,
    () => {
      const subs = createSubCategoriesByCategory.value;
      newProduct.value.sub_category_id = subs[0]?.id ?? 0;
    }
);

async function handleCreate() {
  if (!newProduct.value.sub_category_id) {
    Swal.fire("Validation", "Please select a sub-category", "warning");
    return;
  }
  if (!newProduct.value.name.trim()) {
    Swal.fire("Validation", "Product name is required", "warning");
    return;
  }

  try {
    const created = await createProduct({
      sub_category_id: newProduct.value.sub_category_id,
      name: newProduct.value.name,
      description: newProduct.value.description || null,
      active: newProduct.value.active,
      thumbnailFile: newThumbFile.value,
    });

    products.value.unshift(created);

    Swal.fire({ icon: "success", title: "Product created", timer: 1500, showConfirmButton: false });
    closeCreateModal();
    currentPage.value = 1;
  } catch (e: any) {
    Swal.fire("Error", e?.response?.data?.message || "Failed to create product", "error");
  }
}

// ==========================
// EDIT
// ==========================
function openEditModal(p: Product) {
  currentEditing.value = p;

  // infer category_id from selected subcategory
  const sc = subCategories.value.find((x) => x.id === p.sub_category_id);
  const catId = sc?.category_id ?? 0;

  editingProduct.value = {
    category_id: catId,
    sub_category_id: p.sub_category_id,
    name: p.name,
    description: p.description ?? "",
    active: p.active,
  };

  editThumbFile.value = null;
  editThumbPreview.value = p.thumbnail_url ?? null;

  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  currentEditing.value = null;
  editThumbFile.value = null;
  editThumbPreview.value = null;
}

watch(
    () => editingProduct.value.category_id,
    () => {
      const subs = editSubCategoriesByCategory.value;
      if (!subs.find((x) => x.id === editingProduct.value.sub_category_id)) {
        editingProduct.value.sub_category_id = subs[0]?.id ?? 0;
      }
    }
);

async function handleUpdate() {
  if (!currentEditing.value) return;

  if (!editingProduct.value.sub_category_id) {
    Swal.fire("Validation", "Please select a sub-category", "warning");
    return;
  }
  if (!editingProduct.value.name.trim()) {
    Swal.fire("Validation", "Product name is required", "warning");
    return;
  }

  try {
    const updated = await updateProduct(currentEditing.value.id, {
      sub_category_id: editingProduct.value.sub_category_id,
      name: editingProduct.value.name,
      description: editingProduct.value.description || null,
      active: editingProduct.value.active,
      thumbnailFile: editThumbFile.value,
    });

    const idx = products.value.findIndex((x) => x.id === currentEditing.value?.id);
    if (idx !== -1) products.value.splice(idx, 1, updated);

    Swal.fire({ icon: "success", title: "Product updated", timer: 1500, showConfirmButton: false });
    closeEditModal();
  } catch (e: any) {
    Swal.fire("Error", e?.response?.data?.message || "Failed to update product", "error");
  }
}

// ==========================
// DELETE
// ==========================
async function confirmDelete(p: Product) {
  const confirm = await Swal.fire({
    title: "Delete product?",
    text: `Product "${p.name}" will be removed.`,
    icon: "warning",
    showCancelButton: true,
  });

  if (!confirm.isConfirmed) return;

  try {
    await deleteProduct(p.id);
    products.value = products.value.filter((x) => x.id !== p.id);

    Swal.fire("Deleted!", "Product removed.", "success");

    if (paginatedProducts.value.length === 0 && currentPage.value > 1) currentPage.value--;
  } catch (e: any) {
    Swal.fire("Error", e?.response?.data?.message || "Failed to delete product", "error");
  }
}

onMounted(async () => {
  await loadLookups();
  await loadProducts();
});
</script>

<template>
  <div class="p-3 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Product Management</h1>
      <p class="text-gray-500">Manage products under sub-categories</p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 items-center justify-between">
      <div class="flex flex-wrap gap-2 items-center">
        <div class="w-64">
          <Label>Category</Label>
          <select v-model="selectedCategoryId" class="w-full border rounded px-3 py-2">
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div class="w-64">
          <Label>Sub-Category</Label>
          <select v-model="selectedSubCategoryId" class="w-full border rounded px-3 py-2">
            <option v-for="s in filteredSubCategoriesByCategory" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <div class="relative w-72 mt-6">
          <Input v-model="searchQuery" placeholder="Search product..." @input="currentPage = 1" class="pl-10" />
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <Button @click="openCreateModal" :disabled="subCategories.length === 0">
        <PackagePlus class="w-4 h-4 mr-2" />
        New Product
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
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">THUMB</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">NAME</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SUB CATEGORY</th>
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

        <tr v-else-if="filteredProducts.length === 0">
          <td colspan="6" class="p-6 text-center">
            <FolderIcon class="h-10 w-10 mx-auto opacity-40" />
            <p>No products found</p>
          </td>
        </tr>

        <tr v-for="(p, index) in paginatedProducts" :key="p.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
          <td class="px-6 py-3">{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>

          <td class="px-6 py-3">
            <img v-if="p.thumbnail_url" :src="p.thumbnail_url" class="h-10 w-10 rounded object-cover border" alt="thumb" />
            <span v-else class="text-xs text-gray-400">No image</span>
          </td>

          <td class="px-6 py-3">{{ p.name }}</td>

          <td class="px-6 py-3">{{ getSubCategoryName(p.sub_category_id) }}</td>

          <td class="px-6 py-3">
              <span
                  :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200': p.active,
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200': !p.active,
                }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ p.active ? "Active" : "Inactive" }}
              </span>
          </td>

          <td class="px-6 py-4 text-right space-x-2">
            <button @click="openEditModal(p)"
                    class="inline-flex items-center px-3 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors duration-200">
              <SquarePenIcon class="h-4 w-4 mr-1" /> Edit
            </button>

            <button @click="confirmDelete(p)"
                    class="inline-flex items-center px-3 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200">
              <Trash2Icon class="h-4 w-4 mr-1" /> Delete
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <Pagination
            :items-per-page="itemsPerPage"
            :total="filteredProducts.length"
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
        <DialogHeader><DialogTitle>Create Product</DialogTitle></DialogHeader>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Category</Label>
            <select v-model="newProduct.category_id" class="col-span-3 border rounded px-3 py-2">
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Sub-Category</Label>
            <select v-model="newProduct.sub_category_id" class="col-span-3 border rounded px-3 py-2">
              <option v-for="s in createSubCategoriesByCategory" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Name</Label>
            <Input v-model="newProduct.name" class="col-span-3" />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Thumbnail</Label>
            <div class="col-span-3 space-y-2">
              <Input type="file" accept="image/*" @change="onNewThumbChange" />
              <img v-if="newThumbPreview" :src="newThumbPreview" class="h-20 w-20 rounded object-cover border" />
            </div>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Description</Label>
            <textarea v-model="newProduct.description" class="col-span-3 border rounded px-3 py-2" rows="3"></textarea>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Active</Label>
            <select v-model="newProduct.active" class="col-span-3 border rounded px-3 py-2">
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
        <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Category</Label>
            <select v-model="editingProduct.category_id" class="col-span-3 border rounded px-3 py-2">
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Sub-Category</Label>
            <select v-model="editingProduct.sub_category_id" class="col-span-3 border rounded px-3 py-2">
              <option v-for="s in editSubCategoriesByCategory" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Name</Label>
            <Input v-model="editingProduct.name" class="col-span-3" />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Thumbnail</Label>
            <div class="col-span-3 space-y-2">
              <Input type="file" accept="image/*" @change="onEditThumbChange" />
              <img v-if="editThumbPreview" :src="editThumbPreview" class="h-20 w-20 rounded object-cover border" />
            </div>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Description</Label>
            <textarea v-model="editingProduct.description" class="col-span-3 border rounded px-3 py-2" rows="3"></textarea>
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Active</Label>
            <select v-model="editingProduct.active" class="col-span-3 border rounded px-3 py-2">
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
