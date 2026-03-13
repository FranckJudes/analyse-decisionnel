import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  FileText,
  Upload,
  Image as ImageIcon,
  Code,
  File as FileIcon,
  Save,
  Settings,
  ExternalLink,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeClasses } from '../../hooks/useThemeClasses';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

export interface Step2SharedData {
  loadedBpmnXml?: string;
  modelerInstance?: BpmnModeler | null;
}

export interface Step2ModelHandles {
  exportBpmn: () => Promise<Blob | null>;
}

interface Step2ModelProps {
  isLoading?: boolean;
  analyzeModel?: () => void;
  sharedData?: Step2SharedData;
  setSharedData?: React.Dispatch<React.SetStateAction<Step2SharedData>>;
}

export const Step2Model = forwardRef<Step2ModelHandles, Step2ModelProps>(
  ({ sharedData, setSharedData }, ref) => {
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const modelerRef = useRef<BpmnModeler | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { getTextClasses, getBackgroundClasses } = useThemeClasses();

    const [selectedElement, setSelectedElement] = useState<any>(null);
    const [formValues, setFormValues] = useState({
      name: '',
      documentation: '',
    });
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
      if (!canvasRef.current) {
        return;
      }

      modelerRef.current = new BpmnModeler({
        container: canvasRef.current,
      });

      setSharedData?.((prev) => ({ ...prev, modelerInstance: modelerRef.current }));

      modelerRef.current.createDiagram();
      const modeler = modelerRef.current;

      const handleElementClick = (event: any) => {
        const element = event.element;
        if (element.type !== 'bpmn:Process') {
          const businessObject = element.businessObject;

          setSelectedElement(element);
          setFormValues({
            name: businessObject.name || '',
            documentation: businessObject.documentation?.[0]?.text || '',
          });
        }
      };

      modeler.on('element.click', handleElementClick);

      return () => {
        modeler.off('element.click', handleElementClick);
        modelerRef.current?.destroy();
        modelerRef.current = null;
      };
    }, [setSharedData]);

    useEffect(() => {
      if (modelerRef.current && sharedData?.loadedBpmnXml) {
        modelerRef.current
          .importXML(sharedData.loadedBpmnXml)
          .catch(() => {
            modelerRef.current?.createDiagram();
          });
      }
    }, [sharedData?.loadedBpmnXml]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      setFormValues((prev) => ({ ...prev, [name]: value }));

      if (selectedElement && modelerRef.current) {
        const modeling = modelerRef.current.get('modeling');
        const elementRegistry = modelerRef.current.get('elementRegistry');
        const element = elementRegistry.get(selectedElement.id);

        if (name === 'name') {
          modeling.updateLabel(element, value);
        } else if (name === 'documentation') {
          const bo = element.businessObject;
          bo.documentation = [{ text: value }];
        }
      }
    };

    const handleDownloadXML = async () => {
      if (!modelerRef.current) return;

      try {
        const { xml } = await modelerRef.current.saveXML({ format: true });
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'diagram.bpmn';
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        toast.error('Erreur lors du téléchargement du BPMN.');
      }
    };

    const handleDownloadSVG = async () => {
      if (!modelerRef.current) return;

      try {
        const { svg } = await modelerRef.current.saveSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'diagram.svg';
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        toast.error('Erreur lors du téléchargement du SVG.');
      }
    };

    const handleDownloadPNG = () => {
      if (!canvasRef.current) return;

      const svgElement = canvasRef.current.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas2d = document.createElement('canvas');
      const ctx = canvas2d.getContext('2d');
      const img = new Image();

      img.onload = () => {
        if (!ctx) return;
        canvas2d.width = img.width;
        canvas2d.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas2d.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'diagram.png';
          link.click();
          URL.revokeObjectURL(url);
        });
      };

      img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgData)));
    };

    const handleDownloadJSON = async () => {
      if (!modelerRef.current) return;

      try {
        const { xml } = await modelerRef.current.saveXML({ format: true });
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');

        const xmlToJson = (node: Node): any => {
          const obj: Record<string, any> = {};

          if (node.nodeType === 1 && (node as Element).attributes) {
            Array.from((node as Element).attributes).forEach((attr) => {
              obj[attr.nodeName] = attr.nodeValue;
            });
          } else if (node.nodeType === 3) {
            const textValue = node.nodeValue?.trim();
            if (textValue) {
              obj.text = textValue;
            }
          }

          if (node.hasChildNodes()) {
            Array.from(node.childNodes).forEach((child) => {
              const nodeName = child.nodeName;
              const childValue = xmlToJson(child);
              if (obj[nodeName]) {
                if (!Array.isArray(obj[nodeName])) {
                  obj[nodeName] = [obj[nodeName]];
                }
                obj[nodeName].push(childValue);
              } else {
                obj[nodeName] = childValue;
              }
            });
          }

          return obj;
        };

        const json = JSON.stringify(xmlToJson(xmlDoc), null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'diagram.json';
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        toast.error('Erreur lors du téléchargement du JSON.');
      }
    };

    const handleUploadBPMN = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !modelerRef.current) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const xml = e.target?.result;
        if (typeof xml !== 'string') return;

        modelerRef.current
          ?.importXML(xml)
          .then(() => toast.success('Diagramme BPMN importé.'))
          .catch(() => toast.error("Impossible d'importer ce fichier BPMN."));
      };
      reader.readAsText(file);
      event.target.value = '';
    };

    const toggleFullscreen = () => {
      setIsFullscreen((prev) => !prev);

      setTimeout(() => {
        modelerRef.current?.get('canvas').zoom('fit-viewport');
      }, 100);
    };

    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isFullscreen) {
          setIsFullscreen(false);
        }
      };

      if (isFullscreen) {
        document.addEventListener('keydown', handleKeyPress);
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.removeEventListener('keydown', handleKeyPress);
        document.body.style.overflow = 'unset';
      };
    }, [isFullscreen]);

    useImperativeHandle(ref, () => ({
      exportBpmn: async () => {
        if (!modelerRef.current) return null;

        try {
          const { xml } = await modelerRef.current.saveXML({ format: true });
          return new Blob([xml], { type: 'application/xml' });
        } catch (err) {
          toast.error('Erreur lors de l’export du BPMN.');
          return null;
        }
      },
    }));

    return (
      <div className={`space-y-6 w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 p-6' : ''}`}>
        {!isFullscreen && (
          <div className={`${getBackgroundClasses('muted')} border ${getBackgroundClasses('border')} rounded-lg p-4`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <FileText className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
                <div>
                  <h4 className={`font-medium ${getTextClasses('default')}`}>Éditeur BPMN</h4>
                  <p className={`text-sm ${getTextClasses('muted')} mt-1`}>
                    Concevez votre processus métier. Cliquez sur les éléments pour ajuster leurs propriétés.
                  </p>
                </div>
              </div>
              <a
                href="https://www.bpmn.org/"
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-2 px-3 py-2 ${getBackgroundClasses('card')} ${getTextClasses('muted')} border ${getBackgroundClasses('border')} rounded-lg hover:${getBackgroundClasses('muted')} transition-colors text-sm font-medium`}
              >
                <ExternalLink size={16} />
                Documentation
              </a>
            </div>
          </div>
        )}

        <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-6 h-full`}>
          <div className={`${isFullscreen ? 'col-span-1' : 'lg:col-span-3'}`}>
            <div className={`${getBackgroundClasses('card')} border ${getBackgroundClasses('border')} rounded-lg overflow-hidden h-full flex flex-col`}>
              <div className={`${getBackgroundClasses('muted')} border-b ${getBackgroundClasses('border')} px-4 py-2 flex items-center justify-between`}>
                <h3 className={`text-sm font-medium ${getTextClasses('default')}`}>
                  {isFullscreen ? 'Mode Plein Écran - Concepteur BPMN' : 'Concepteur de processus métier'}
                </h3>
                <button
                  onClick={toggleFullscreen}
                  className={`flex items-center gap-2 px-3 py-1 ${getBackgroundClasses('secondary')} hover:${getBackgroundClasses('muted')} rounded-md transition-colors text-sm font-medium ${getTextClasses('default')}`}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 size={16} />
                      Réduire
                    </>
                  ) : (
                    <>
                      <Maximize2 size={16} />
                      Plein écran
                    </>
                  )}
                </button>
              </div>
              <div
                ref={canvasRef}
                className="w-full flex-1"
                style={{
                  height: isFullscreen ? 'calc(100vh - 220px)' : '70vh',
                  minHeight: isFullscreen ? '600px' : 'auto',
                }}
              />
            </div>
          </div>

          {!isFullscreen && (
            <div className="lg:col-span-1 space-y-6">
              <div className={`${getBackgroundClasses('card')} border ${getBackgroundClasses('border')} rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={16} className={getTextClasses('muted')} />
                  <h3 className={`font-medium ${getTextClasses('default')}`}>Propriétés de l'élément</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${getTextClasses('default')} mb-1`}>
                      Nom
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formValues.name}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      placeholder="Nom de l'élément"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${getTextClasses('default')} mb-1`}>
                      Documentation
                    </label>
                    <textarea
                      name="documentation"
                      value={formValues.documentation}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#3c50e0] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      placeholder="Description de l'élément"
                    />
                  </div>
                </div>
              </div>

              <div className={`${getBackgroundClasses('card')} border ${getBackgroundClasses('border')} rounded-lg p-4`}>
                <h3 className={`font-medium ${getTextClasses('default')} mb-4`}>Import / Export</h3>

                <div className="mb-4">
                  <div className={`text-sm font-medium ${getTextClasses('default')} mb-2`}>Importer</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".bpmn"
                    onChange={handleUploadBPMN}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Upload size={16} />
                    Importer BPMN
                  </button>
                </div>

                <div>
                  <div className={`text-sm font-medium ${getTextClasses('default')} mb-2`}>Télécharger</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDownloadPNG}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                    >
                      <ImageIcon size={14} />
                      PNG
                    </button>
                    <button
                      onClick={handleDownloadSVG}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                    >
                      <Save size={14} />
                      SVG
                    </button>
                    <button
                      onClick={handleDownloadXML}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
                    >
                      <FileIcon size={14} />
                      BPMN
                    </button>
                    <button
                      onClick={handleDownloadJSON}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs"
                    >
                      <Code size={14} />
                      JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

Step2Model.displayName = 'Step2Model';
