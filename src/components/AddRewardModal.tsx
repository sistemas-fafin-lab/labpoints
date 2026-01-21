import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Image, Loader2, Gift, Tag, Coins, FileText, Sparkles, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { createReward, uploadRewardImage } from '../hooks/useRewards';
import { useToast } from './ui/Toast';

interface AddRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddRewardModal({ isOpen, onClose, onSuccess }: AddRewardModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    custo_points: '',
    categoria: '',
    ativo: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setForm({
        titulo: '',
        descricao: '',
        custo_points: '',
        categoria: '',
        ativo: true,
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Tipo de arquivo não permitido. Use apenas JPEG ou PNG.', 'error');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('Arquivo muito grande. O tamanho máximo é 5MB.', 'error');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.titulo || !form.descricao || !form.custo_points || !form.categoria) {
      showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const custo = parseInt(form.custo_points);
    if (isNaN(custo) || custo <= 0) {
      showToast('Custo deve ser um número positivo', 'error');
      return;
    }

    setSaving(true);

    try {
      let imageUrl: string | null = null;

      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadRewardImage(imageFile);
        } catch (uploadError) {
          showToast((uploadError as Error).message || 'Erro ao fazer upload da imagem', 'error');
          setSaving(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // Create reward
      await createReward({
        titulo: form.titulo,
        descricao: form.descricao,
        custo_points: custo,
        categoria: form.categoria,
        imagem_url: imageUrl,
        ativo: form.ativo,
      });

      onSuccess();
    } catch (error) {
      showToast('Erro ao cadastrar recompensa', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ margin: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-fade-in" />
      
      {/* Modal Container */}
      <div className="relative z-10 flex items-center justify-center w-full max-h-screen overflow-y-auto py-8">
        {/* Modal */}
        <div 
          className="relative bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/50 animate-scale-in my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient and decorations */}
          <div className="relative bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 p-7 text-white overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
              <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            </div>
            
            {/* Close button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              disabled={saving}
              className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Fechar modal"
            >
              <X size={18} strokeWidth={2.5} className="text-white" />
            </button>
            
            <div className="relative flex items-center gap-5 pr-12">
              <div className="w-16 h-16 rounded-2xl bg-white/20 ring-2 ring-white/20 flex items-center justify-center backdrop-blur-sm shadow-lg transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <Gift size={32} strokeWidth={2} className="drop-shadow-lg text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-ranade font-bold tracking-tight drop-shadow-sm text-white">
                  Nova Recompensa
                </h2>
                <p className="text-white/90 text-sm font-dm-sans mt-0.5">
                  Cadastre uma recompensa para os colaboradores
                </p>
              </div>
            </div>
            
            {/* Sparkle decorations */}
            <div className="absolute bottom-3 right-20">
              <Sparkles size={20} className="text-white/40 animate-pulse" />
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
            {/* Título */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                <Tag size={16} className="text-lab-primary" />
                Título da Recompensa
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Vale Presente, Day Off, etc..."
                disabled={saving}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-lab-primary focus:bg-white focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Categoria e Custo em grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                  <FileText size={16} className="text-indigo-500" />
                  Categoria
                </label>
                <input
                  type="text"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  placeholder="Ex: Experiência, Produto..."
                  disabled={saving}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                  <Coins size={16} className="text-amber-500" />
                  Custo em Lab Points
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.custo_points}
                  onChange={(e) => setForm({ ...form, custo_points: e.target.value })}
                  placeholder="Ex: 500"
                  disabled={saving}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Imagem Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                <Image size={16} className="text-purple-500" />
                Imagem da Recompensa
              </label>
              
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-purple-200 group transition-all duration-300 hover:border-purple-400 hover:shadow-lg">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={saving}
                    className="absolute top-3 right-3 p-2.5 rounded-xl bg-red-500/90 text-white hover:bg-red-600 transition-all duration-300 shadow-lg hover:scale-110 hover:rotate-6 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={16} />
                  </button>
                  
                  {/* Success indicator */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/90 text-white text-xs font-dm-sans font-medium backdrop-blur-sm">
                    <Check size={14} />
                    Imagem selecionada
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => !saving && fileInputRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center transition-all duration-300 overflow-hidden group ${
                    saving 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-purple-400 hover:bg-purple-50/50 cursor-pointer hover:shadow-lg'
                  }`}
                >
                  {/* Background decoration */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/30 rounded-full blur-xl -translate-x-1/2 translate-y-1/2" />
                  </div>
                  
                  <div className="relative flex flex-col items-center gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Upload size={32} className="text-purple-500 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-dm-sans text-slate-600 font-semibold group-hover:text-purple-600 transition-colors">
                        Clique para fazer upload
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        JPEG ou PNG (máx. 5MB)
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 rounded-xl bg-white border-2 border-purple-200 text-purple-600 text-sm font-dm-sans font-medium hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Selecionar Arquivo
                    </button>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileSelect}
                className="hidden"
                disabled={saving}
              />
            </div>

            {/* Descrição */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                <FileText size={16} className="text-emerald-500" />
                Descrição
              </label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                rows={4}
                placeholder="Descreva os detalhes e condições da recompensa..."
                disabled={saving}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
            </div>

            {/* Ativo Toggle */}
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:border-slate-300 transition-all duration-300 group">
              <button
                type="button"
                onClick={() => !saving && setForm({ ...form, ativo: !form.ativo })}
                disabled={saving}
                className={`relative inline-flex items-center flex-shrink-0 h-8 w-14 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-lab-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer p-1 ${
                  form.ativo 
                    ? 'bg-gradient-to-r from-lab-primary to-indigo-500' 
                    : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-slate-100 shadow-lg ring-2 ring-slate-200/50 transition-transform duration-300 ${
                    form.ativo ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-dm-sans font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                  Recompensa Ativa
                </p>
                <p className="text-sm text-slate-500 font-dm-sans">
                  {form.ativo ? 'Visível para todos os colaboradores' : 'Oculta do catálogo de recompensas'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300 mr-2 ${form.ativo ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-slate-300'}`} />
            </div>
          </div>

          {/* Footer with actions */}
          <div className="sticky bottom-0 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 p-5 flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={saving}
              className="hover:scale-105 transition-transform duration-300"
            >
              Cancelar
            </Button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-lab-primary via-indigo-500 to-purple-600 text-white font-ranade font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <span className="relative flex items-center gap-2 text-white">
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-white" />
                    <span className="text-white">{uploadingImage ? 'Enviando imagem...' : 'Salvando...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-white" />
                    <span className="text-white">Cadastrar Recompensa</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
