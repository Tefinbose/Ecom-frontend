import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  Save,
  LoaderCircle,
  Search,
  Settings2,
  Globe,
  X,
} from "lucide-react";

import {
  getCollectionById,
  createCollection,
  updateCollection,
} from "../../services/collectionService";
import { getImageUrl } from "../../services/api";


const INITIAL_FORM = {
  title: "",
  description: "",
  handle: "",
  themeTemplate: "Default collection",
  altText: "",
  publishing: {
    allChannels: false,
    salesChannels: [],
    publishedAt: "",
  },
  seo: {
    pageTitle: "",
    metaDescription: "",
    urlHandle: "",
  },
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

export default function CollectionForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;

    let cancelled = false;

    const loadCollection = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCollectionById(id);
        const collection = response.collection || response.data?.collection;

        if (!collection) {
          throw new Error("Collection data was not returned by the server.");
        }

        if (cancelled) return;

        setForm({
          title: collection.title || "",
          description: collection.description || "",
          handle: collection.handle || "",
          themeTemplate:
            collection.themeTemplate || "Default collection",
          altText: collection.image?.altText || "",
          publishing: {
            allChannels: collection.publishing?.allChannels ?? false,
            salesChannels: collection.publishing?.salesChannels || [],
            publishedAt: collection.publishing?.publishedAt
              ? new Date(collection.publishing.publishedAt)
                  .toISOString()
                  .slice(0, 16)
              : "",
          },
          seo: {
            pageTitle: collection.seo?.pageTitle || "",
            metaDescription: collection.seo?.metaDescription || "",
            urlHandle: collection.seo?.urlHandle || "",
          },
        });

        setImagePreview(
          collection.image?.url ? getImageUrl(collection.image.url) : ""
        );
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCollection();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateNestedField = (group, field, value) => {
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  };

  const handleTitleChange = (value) => {
    setForm((current) => ({
      ...current,
      title: value,
      handle: current.handle
        ? current.handle
        : value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview((previous) => {
      if (previous.startsWith("blob:")) URL.revokeObjectURL(previous);
      return previewUrl;
    });
  };

  const removeImage = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Collection title is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("handle", form.handle.trim());
      payload.append("themeTemplate", form.themeTemplate);
      payload.append("altText", form.altText);

      let publishedAtIso = null;
      if (form.publishing.publishedAt) {
        const parsedDate = new Date(form.publishing.publishedAt);
        if (!isNaN(parsedDate.getTime())) {
          publishedAtIso = parsedDate.toISOString();
        }
      }

      payload.append(
        "publishing",
        JSON.stringify({
          ...form.publishing,
          publishedAt: publishedAtIso,
        })
      );

      payload.append("seo", JSON.stringify(form.seo));

      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (isEditing) {
        await updateCollection(id, payload);
      } else {
        await createCollection(payload);
      }

      navigate("/admin/collections", {
        state: {
          message: isEditing
            ? "Collection updated successfully."
            : "Collection created successfully.",
        },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
        <LoaderCircle size={20} className="animate-spin" />
        Loading collection...
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-7">
        <button
          type="button"
          onClick={() => navigate("/admin/collections")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to collections
        </button>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-medium text-indigo-600">
              Catalog management
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {isEditing ? "Edit collection" : "Create collection"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Configure your collection details, image, publishing, and SEO.
            </p>
          </div>

          <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
            {isEditing ? "EDIT MODE" : "NEW COLLECTION"}
          </span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Basic details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                  <Settings2 size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Basic information
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    The name and description customers will see.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>
                    Collection title <span className="text-red-500">*</span>
                  </label>

                  <input
                    className={inputClass}
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Summer Essentials"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Description</label>

                  <textarea
                    className={`${inputClass} min-h-32 resize-y`}
                    value={form.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    placeholder="Describe the products in this collection..."
                    rows={4}
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    Provide a short description of this collection.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>URL handle</label>

                  <div className="flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-indigo-500">
                    <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-xs text-slate-500">
                      /collections/
                    </span>

                    <input
                      className="min-w-0 flex-1 px-3 py-3 text-sm outline-none"
                      value={form.handle}
                      onChange={(e) => updateField("handle", e.target.value)}
                      placeholder="summer-essentials"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                  <ImagePlus size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Collection image
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Add a cover image to represent this collection.
                  </p>
                </div>
              </div>

              {imagePreview ? (
                <div className="relative overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={imagePreview}
                    alt={form.altText || form.title || "Collection preview"}
                    className="h-56 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-3 top-3 rounded-lg bg-white p-2 text-slate-700 shadow hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove image"
                  >
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40">
                  <div className="mb-3 rounded-xl bg-white p-3 text-indigo-600 shadow-sm">
                    <ImagePlus size={24} />
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    Upload collection image
                  </span>
                  <span className="mt-1 text-xs text-slate-400">
                    Select an image from your computer
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}

              {imagePreview && (
                <label className={`${labelClass} mt-5`}>
                  Image alt text
                  <input
                    className={`${inputClass} mt-2`}
                    value={form.altText}
                    onChange={(e) => updateField("altText", e.target.value)}
                    placeholder="Describe the image for accessibility"
                  />
                </label>
              )}

              {imagePreview && (
                <label className="mt-4 block cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Replace image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            {/* SEO */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                  <Search size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Search engine listing
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Customize how this collection appears in search results.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Page title</label>
                  <input
                    className={inputClass}
                    value={form.seo.pageTitle}
                    onChange={(e) =>
                      updateNestedField("seo", "pageTitle", e.target.value)
                    }
                    placeholder="Collection page title"
                    maxLength={70}
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {form.seo.pageTitle.length}/70
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Meta description</label>
                  <textarea
                    className={`${inputClass} min-h-24 resize-y`}
                    value={form.seo.metaDescription}
                    onChange={(e) =>
                      updateNestedField(
                        "seo",
                        "metaDescription",
                        e.target.value
                      )
                    }
                    placeholder="Summarize this collection for search engines..."
                    maxLength={320}
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {form.seo.metaDescription.length}/320
                  </p>
                </div>

                <div>
                  <label className={labelClass}>SEO URL handle</label>
                  <input
                    className={inputClass}
                    value={form.seo.urlHandle}
                    onChange={(e) =>
                      updateNestedField("seo", "urlHandle", e.target.value)
                    }
                    placeholder="summer-essentials"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Publishing */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Globe size={20} className="text-indigo-600" />
                <h2 className="font-semibold text-slate-900">Publishing</h2>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={form.publishing.allChannels}
                  onChange={(e) =>
                    updateNestedField(
                      "publishing",
                      "allChannels",
                      e.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-indigo-600"
                />

                <span>
                  <span className="block text-sm font-medium text-slate-800">
                    All sales channels
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Make this collection available across all channels.
                  </span>
                </span>
              </label>

              <label className="mb-2 mt-5 block text-sm font-semibold text-slate-700">
                Specific sales channels
              </label>

              <input
                className={inputClass}
                value={form.publishing.salesChannels.join(", ")}
                onChange={(e) =>
                  updateNestedField(
                    "publishing",
                    "salesChannels",
                    e.target.value
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="Online Store, POS"
              />

              <p className="mt-2 text-xs text-slate-400">
                Separate channel names with commas.
              </p>

              <label className={`${labelClass} mt-5`}>
                Publishing date
                <input
                  type="datetime-local"
                  className={`${inputClass} mt-2`}
                  value={form.publishing.publishedAt}
                  onChange={(e) =>
                    updateNestedField(
                      "publishing",
                      "publishedAt",
                      e.target.value
                    )
                  }
                />
              </label>
            </div>

            {/* Theme */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-slate-900">
                Theme template
              </h2>

              <label className={labelClass}>Collection template</label>

              <select
                className={inputClass}
                value={form.themeTemplate}
                onChange={(e) =>
                  updateField("themeTemplate", e.target.value)
                }
              >
                <option value="Default collection">
                  Default collection
                </option>
                <option value="Featured collection">
                  Featured collection
                </option>
                <option value="Seasonal collection">
                  Seasonal collection
                </option>
                <option value="Promotional collection">
                  Promotional collection
                </option>
              </select>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                These are frontend choices stored in your existing
                themeTemplate field. They will not create templates on the
                backend.
              </p>
            </div>

            {/* Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-slate-900">
                Collection preview
              </h2>

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt=""
                  className="mb-3 h-36 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="mb-3 flex h-36 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <ImagePlus size={30} />
                </div>
              )}

              <p className="font-semibold text-slate-900">
                {form.title || "Collection title"}
              </p>

              <p className="mt-1 line-clamp-3 text-sm text-slate-500">
                {form.description || "Your collection description appears here."}
              </p>

              <p className="mt-3 break-all text-xs text-indigo-600">
                /collections/{form.handle || "collection-handle"}
              </p>
            </div>
          </aside>
        </div>

        {/* Footer actions */}
        <div className="mt-7 flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/admin/collections")}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {saving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create collection"}
          </button>
        </div>
      </form>
    </section>
  );
}