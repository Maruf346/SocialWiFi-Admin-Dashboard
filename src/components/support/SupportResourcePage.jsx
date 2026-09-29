import { useEffect, useMemo, useRef, useState } from "react";
import { supportResourcesApi } from "../../api/supportResourcesApi";

const allowedExtensions = ["jpg", "jpeg", "png", "pdf", "doc", "docx", "txt"];

const normalizeResource = (resource) => ({
  id: resource.id,
  name: resource.title || resource.file_name || `Resource ${resource.id}`,
  url: resource.download_url || resource.file || "",
  category: resource.category || "",
});

const SupportResourcePage = ({ title, resourceCategory, uploadTitle, uploadDescription, selectAllLabel, searchId, actionId }) => {
  const [resources, setResources] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await supportResourcesApi.list();
      const list = Array.isArray(response) ? response : [];
      setResources(list.map(normalizeResource).filter((resource) => resource.category === resourceCategory));
    } catch (err) {
      setResources([]);
      setError(err.message || "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const visibleResources = useMemo(
    () => resources.filter((resource) => resource.name.toLowerCase().includes(search.toLowerCase())),
    [resources, search],
  );

  const toggleResource = (id) =>
    setSelectedResources((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );

  const deleteSelected = async () => {
    if (selectedResources.length === 0) return;
    try {
      setError("");
      await Promise.all(selectedResources.map((id) => supportResourcesApi.delete(id)));
      setSelectedResources([]);
      loadResources();
    } catch (err) {
      setError(err.message || "Failed to delete selected resources.");
    }
  };

  const selectVisible = () =>
    setSelectedResources((current) =>
      visibleResources.every((resource) => current.includes(resource.id))
        ? current.filter((id) => !visibleResources.some((resource) => resource.id === id))
        : [...new Set([...current, ...visibleResources.map((resource) => resource.id)])],
    );

  const openResource = (resource) => {
    if (resource.url) window.open(resource.url, "_blank", "noopener,noreferrer");
  };

  const downloadResource = (resource) => {
    if (resource.url) {
      const link = document.createElement("a");
      link.href = resource.url;
      link.download = resource.name;
      link.click();
    }
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    const invalid = files.find((file) => !allowedExtensions.includes(file.name.split(".").pop().toLowerCase()));

    if (invalid) {
      setError(`${invalid.name} is not an allowed file type.`);
      event.target.value = "";
      return;
    }

    try {
      setError("");
      await Promise.all(
        files.map((file) =>
          supportResourcesApi.create({
            title: file.name,
            file,
            category: resourceCategory,
            is_active: true,
          }),
        ),
      );
      setUploadOpen(false);
      event.target.value = "";
      loadResources();
    } catch (err) {
      setError(err.message || "Failed to upload resource.");
    }
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[#777] md:px-8 md:py-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-normal text-[#999] md:text-2xl">{title}</h1>
        <button type="button" onClick={() => setUploadOpen(true)} className="rounded-full bg-[#777] px-3 py-1 text-xs text-white cursor-pointer hover:bg-[#666]">
          UPLOAD RESOURCE <span className="text-base font-bold">+</span>
        </button>
      </div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-1">
          <select id={actionId} defaultValue="" className="h-8 w-60 border border-[#ccc] bg-white px-2 text-xs outline-none">
            <option value="">-----------</option>
            <option value="delete">Delete selected resources</option>
          </select>
          <button type="button" onClick={deleteSelected} className="h-8 border border-[#ccc] bg-[#f4f4f4] px-3 text-xs cursor-pointer">Go</button>
          <span className="ml-2 text-xs">{selectedResources.length} of {resources.length} selected</span>
        </div>
        <label htmlFor={searchId}>
          Search:
          <span className="ml-2 inline-flex items-center gap-1">
            <input id={searchId} value={search} onChange={(event) => setSearch(event.target.value)} className="h-8 w-56 border border-[#ccc] px-2 outline-none" />
            <button type="button" onClick={() => setSearch(search.trim())} className="h-8 border border-[#ccc] bg-[#f4f4f4] px-2 text-xs cursor-pointer">Go</button>
          </span>
        </label>
      </div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#f3f3f3] text-left text-xs uppercase text-[#888]">
              <th className="w-10 px-2 py-2"><input type="checkbox" checked={visibleResources.length > 0 && visibleResources.every((resource) => selectedResources.includes(resource.id))} onChange={selectVisible} aria-label={selectAllLabel} /></th>
              <th className="px-2 py-2">Resources</th>
              <th className="w-24 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="py-8 text-center text-[#888]">Loading resources...</td></tr>
            ) : visibleResources.length === 0 ? (
              <tr><td colSpan={3} className="py-8 text-center text-[#888]">No resources available.</td></tr>
            ) : (
              visibleResources.map((resource) => (
                <tr key={resource.id} className="border-b border-white bg-[#f7f7f7] even:bg-[#fbfbfb]">
                  <td className="px-2 py-2"><input type="checkbox" checked={selectedResources.includes(resource.id)} onChange={() => toggleResource(resource.id)} aria-label={`Select ${resource.name}`} /></td>
                  <td className="px-2 py-2"><button type="button" onClick={() => openResource(resource)} className="font-semibold underline underline-offset-2 hover:text-[#ff823d]">{resource.name}</button></td>
                  <td className="px-2 py-2"><button type="button" onClick={() => downloadResource(resource)} disabled={!resource.url} className="rounded border border-[#bbb] bg-[#f5f5f5] px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60">Download</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="border-b border-[#eee] py-4 text-sm">{visibleResources.length} resources</p>
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="upload-resource-title" className="w-full max-w-md rounded border border-[#ccc] bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between"><h2 id="upload-resource-title" className="text-lg font-semibold text-[#444]">{uploadTitle}</h2><button type="button" onClick={() => setUploadOpen(false)} aria-label="Close upload dialog" className="text-xl">&times;</button></div>
            <p className="mt-3 text-sm">{uploadDescription}</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 rounded bg-[#ff823d] px-4 py-2 text-sm font-semibold text-white">Choose files</button>
            <button type="button" onClick={() => setUploadOpen(false)} className="ml-2 rounded border border-[#bbb] px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportResourcePage;
