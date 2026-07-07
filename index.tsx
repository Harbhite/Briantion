/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

//Vibe coded by ammaar@google.com

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { Artifact, Session, ComponentVariation, LayoutOption } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';
import { generateId } from './utils';
import html2canvas from 'html2canvas';
import { PROMPT_TEMPLATES } from './promptTemplates';

import DottedGlowBackground from './components/DottedGlowBackground';
import ArtifactCard from './components/ArtifactCard';
import SideDrawer from './components/SideDrawer';
import { 
    ThinkingIcon, 
    CodeIcon, 
    SparklesIcon, 
    ArrowLeftIcon, 
    ArrowRightIcon, 
    ArrowUpIcon, 
    GridIcon,
    CopyIcon,
    CheckIcon,
    DownloadIcon,
    ExternalLinkIcon,
    ExportIcon,
    AttachmentIcon,
    TrashIcon,
    HistoryIcon,
    VideoIcon,
    SettingsIcon,
    SlidersIcon,
    CameraIcon
} from './components/Icons';

function App() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const saved = localStorage.getItem('flash_ui_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Failed to load sessions from localStorage", e);
      return [];
    }
  });
  
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('flash_ui_current_session_index');
      return saved ? parseInt(saved, 10) : -1;
    } catch (e) {
      return -1;
    }
  });

  const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);
  
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholders, setPlaceholders] = useState<string[]>(INITIAL_PLACEHOLDERS);
  
  const [drawerState, setDrawerState] = useState<{
      isOpen: boolean;
      mode: 'code' | 'variations' | null;
      title: string;
      data: any; 
  }>({ isOpen: false, mode: null, title: '', data: null });

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [attachedFile, setAttachedFile] = useState<{
      name: string;
      mimeType: string;
      base64Data: string;
      previewUrl: string;
  } | null>(null);

  const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);

  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [showExportDropdown, setShowExportDropdown] = useState<boolean>(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState<boolean>(false);

  // Settings panel and custom design specifications
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);
  const [generationTemperature, setGenerationTemperature] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('flash_ui_temperature');
      return saved ? parseFloat(saved) : 1.2;
    } catch {
      return 1.2;
    }
  });
  const [referenceAdherence, setReferenceAdherence] = useState<string>(() => {
    return localStorage.getItem('flash_ui_adherence') || 'high';
  });
  const [specTypography, setSpecTypography] = useState<string>(() => {
    return localStorage.getItem('flash_ui_spec_typography') || '';
  });
  const [specColorScheme, setSpecColorScheme] = useState<string>(() => {
    return localStorage.getItem('flash_ui_spec_color_scheme') || '';
  });
  const [specStructuring, setSpecStructuring] = useState<string>(() => {
    return localStorage.getItem('flash_ui_spec_structuring') || '';
  });
  const [specStyle, setSpecStyle] = useState<string>(() => {
    return localStorage.getItem('flash_ui_spec_style') || '';
  });
  const [specGeneral, setSpecGeneral] = useState<string>(() => {
    return localStorage.getItem('flash_ui_spec_general') || '';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync sessions and index to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flash_ui_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn("Failed to sync sessions to localStorage", e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('flash_ui_current_session_index', currentSessionIndex.toString());
    } catch (e) {
      console.warn("Failed to sync current index to localStorage", e);
    }
  }, [currentSessionIndex]);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('flash_ui_temperature', generationTemperature.toString());
  }, [generationTemperature]);

  useEffect(() => {
    localStorage.setItem('flash_ui_adherence', referenceAdherence);
  }, [referenceAdherence]);

  useEffect(() => {
    localStorage.setItem('flash_ui_spec_typography', specTypography);
  }, [specTypography]);

  useEffect(() => {
    localStorage.setItem('flash_ui_spec_color_scheme', specColorScheme);
  }, [specColorScheme]);

  useEffect(() => {
    localStorage.setItem('flash_ui_spec_structuring', specStructuring);
  }, [specStructuring]);

  useEffect(() => {
    localStorage.setItem('flash_ui_spec_style', specStyle);
  }, [specStyle]);

  useEffect(() => {
    localStorage.setItem('flash_ui_spec_general', specGeneral);
  }, [specGeneral]);

  const handleAttachmentClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 15 * 1024 * 1024) {
          alert("Reference file is too large. Please select a file under 15MB.");
          return;
      }

      const reader = new FileReader();
      reader.onload = () => {
          const resultStr = reader.result as string;
          const commaIndex = resultStr.indexOf(',');
          const base64Data = commaIndex !== -1 ? resultStr.substring(commaIndex + 1) : resultStr;
          
          setAttachedFile({
              name: file.name,
              mimeType: file.type,
              base64Data,
              previewUrl: resultStr
          });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
  };

  const handleRemoveAttachment = () => {
      setAttachedFile(null);
  };

  const handleDeleteSession = (indexToDelete: number) => {
      const newSessions = sessions.filter((_, i) => i !== indexToDelete);
      setSessions(newSessions);
      
      if (newSessions.length === 0) {
          setCurrentSessionIndex(-1);
          setFocusedArtifactIndex(null);
      } else if (currentSessionIndex === indexToDelete) {
          setCurrentSessionIndex(newSessions.length - 1);
          setFocusedArtifactIndex(null);
      } else if (currentSessionIndex > indexToDelete) {
          setCurrentSessionIndex(currentSessionIndex - 1);
      }
  };

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
    }).catch(err => {
        console.error("Failed to copy code: ", err);
    });
  }, []);

  const handleDownloadHtml = useCallback((html: string, styleName: string) => {
    const cleanFilename = styleName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'component';
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanFilename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleOpenPreview = useCallback((html: string) => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }, []);

  const handleCaptureScreenshot = useCallback(async (styleName: string) => {
    const iframe = document.querySelector('.artifact-card.focused .artifact-iframe') as HTMLIFrameElement;
    if (!iframe) {
        alert('Active preview iframe not found.');
        return;
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
        alert('Cannot access preview document.');
        return;
    }

    setIsCapturingScreenshot(true);
    try {
        // Wait briefly for style recalculations and layout stability
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const targetElement = iframeDoc.body || iframeDoc.documentElement;
        
        // Find iframe dimensions to capture everything clearly
        const originalWidth = targetElement.scrollWidth || targetElement.clientWidth || 1024;
        const originalHeight = targetElement.scrollHeight || targetElement.clientHeight || 768;

        const canvas = await html2canvas(targetElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#121214', // sleek modern default fallback
            logging: false,
            scale: 2, // High resolution/retina scale
            width: originalWidth,
            height: originalHeight,
            windowWidth: originalWidth,
            windowHeight: originalHeight,
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDoc) => {
                const clonedBody = clonedDoc.body;
                if (clonedBody) {
                    clonedBody.style.overflow = 'hidden';
                }
            }
        });

        const imgData = canvas.toDataURL('image/png');
        const cleanFilename = styleName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || 'screenshot';

        const a = document.createElement('a');
        a.href = imgData;
        a.download = `flash-ui-${cleanFilename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (err) {
        console.error('Screenshot capture failed:', err);
        alert('Failed to capture screenshot. You can also view it in full screen or in a new tab.');
    } finally {
        setIsCapturingScreenshot(false);
    }
  }, []);

  const handleSelectTemplate = useCallback((template: typeof PROMPT_TEMPLATES[0]) => {
      setInputValue(template.prompt);
      setSpecTypography(template.specs.typography);
      setSpecColorScheme(template.specs.colorScheme);
      setSpecStructuring(template.specs.structuring);
      setSpecStyle(template.specs.style);
      setShowSettings(true);
      setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      inputRef.current?.focus();
  }, []);

  // Fix for mobile: reset scroll when focusing an item to prevent "overscroll" state
  useEffect(() => {
    if (focusedArtifactIndex !== null && window.innerWidth <= 1024) {
        if (gridScrollRef.current) {
            gridScrollRef.current.scrollTop = 0;
        }
        window.scrollTo(0, 0);
    }
  }, [focusedArtifactIndex]);

  // Cycle placeholders
  useEffect(() => {
      const interval = setInterval(() => {
          setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
      }, 3000);
      return () => clearInterval(interval);
  }, [placeholders.length]);

  // Dynamic placeholder generation on load
  useEffect(() => {
      const fetchDynamicPlaceholders = async () => {
          try {
              const apiKey = process.env.API_KEY;
              if (!apiKey) return;
              const ai = new GoogleGenAI({ apiKey });
              const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: { 
                      role: 'user', 
                      parts: [{ 
                          text: 'Generate 20 creative, short, diverse UI component prompts (e.g. "bioluminescent task list"). Return ONLY a raw JSON array of strings. IP SAFEGUARD: Avoid referencing specific famous artists, movies, or brands.' 
                      }] 
                  }
              });
              const text = response.text || '[]';
              const jsonMatch = text.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                  const newPlaceholders = JSON.parse(jsonMatch[0]);
                  if (Array.isArray(newPlaceholders) && newPlaceholders.length > 0) {
                      const shuffled = newPlaceholders.sort(() => 0.5 - Math.random()).slice(0, 10);
                      setPlaceholders(prev => [...prev, ...shuffled]);
                  }
              }
          } catch (e) {
              console.warn("Silently failed to fetch dynamic placeholders", e);
          }
      };
      setTimeout(fetchDynamicPlaceholders, 1000);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const parseJsonStream = async function* (responseStream: AsyncGenerator<{ text: string }>) {
      let buffer = '';
      for await (const chunk of responseStream) {
          const text = chunk.text;
          if (typeof text !== 'string') continue;
          buffer += text;
          let braceCount = 0;
          let start = buffer.indexOf('{');
          while (start !== -1) {
              braceCount = 0;
              let end = -1;
              for (let i = start; i < buffer.length; i++) {
                  if (buffer[i] === '{') braceCount++;
                  else if (buffer[i] === '}') braceCount--;
                  if (braceCount === 0 && i > start) {
                      end = i;
                      break;
                  }
              }
              if (end !== -1) {
                  const jsonString = buffer.substring(start, end + 1);
                  try {
                      yield JSON.parse(jsonString);
                      buffer = buffer.substring(end + 1);
                      start = buffer.indexOf('{');
                  } catch (e) {
                      start = buffer.indexOf('{', start + 1);
                  }
              } else {
                  break; 
              }
          }
      }
  };

  const handleGenerateVariations = useCallback(async () => {
    const currentSession = sessions[currentSessionIndex];
    if (!currentSession || focusedArtifactIndex === null) return;
    const currentArtifact = currentSession.artifacts[focusedArtifactIndex];

    setIsLoading(true);
    setComponentVariations([]);
    setDrawerState({ isOpen: true, mode: 'variations', title: 'Variations', data: currentArtifact.id });

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API_KEY is not configured.");
        const ai = new GoogleGenAI({ apiKey });

        let specsPrompt = '';
        if (specTypography.trim() || specColorScheme.trim() || specStructuring.trim() || specStyle.trim() || specGeneral.trim()) {
            specsPrompt += `\n\n**USER-SPECIFIED STYLE GUIDE AND SPECIFICATIONS:**\n`;
            if (specTypography.trim()) specsPrompt += `- **Typography & Text Guidelines**: ${specTypography.trim()}\n`;
            if (specColorScheme.trim()) specsPrompt += `- **Color Scheme & Palette**: ${specColorScheme.trim()}\n`;
            if (specStructuring.trim()) specsPrompt += `- **Structuring & Layout**: ${specStructuring.trim()}\n`;
            if (specStyle.trim()) specsPrompt += `- **Visual Style & Themes**: ${specStyle.trim()}\n`;
            if (specGeneral.trim()) specsPrompt += `- **General Notes & Behavior**: ${specGeneral.trim()}\n`;
        }

        const prompt = `
You are a master UI/UX designer. Generate 3 RADICAL CONCEPTUAL VARIATIONS of: "${currentSession.prompt}".

**STRICT IP SAFEGUARD:**
No names of artists. 
Instead, describe the *Physicality* and *Material Logic* of the UI.

**CREATIVE GUIDANCE (Use these as EXAMPLES of how to describe style, but INVENT YOUR OWN):**
1. Example: "Asymmetrical Primary Grid" (Heavy black strokes, rectilinear structure, flat primary pigments, high-contrast white space).
2. Example: "Suspended Kinetic Mobile" (Delicate wire-thin connections, floating organic primary shapes, slow-motion balance, white-void background).
3. Example: "Grainy Risograph Press" (Overprinted translucent inks, dithered grain textures, monochromatic color depth, raw paper substrate).
4. Example: "Volumetric Spectral Fluid" (Generative morphing gradients, soft-focus diffusion, bioluminescent light sources, spectral chromatic aberration).

**YOUR TASK:**
For EACH variation:
- Invent a unique design persona name based on a NEW physical metaphor.
- Rewrite the prompt to fully adopt that metaphor's visual language.
- Generate high-fidelity HTML/CSS.

Required JSON Output Format (stream ONE object per line):
\`{ "name": "Persona Name", "html": "..." }\`${specsPrompt}
        `.trim();

        const contents: any[] = [];
        if (currentSession.attachedFile) {
            let adherenceText = '';
            if (referenceAdherence === 'low') {
                adherenceText = `The attached file is only a very loose, abstract inspiration. DO NOT copy its layout or text. Be as creative as possible, focusing on a new layout and style elements while maintaining only a passing spiritual resemblance.`;
            } else if (referenceAdherence === 'medium') {
                adherenceText = `Balance the visual cues from the attached file with original creative ideas. Adopt the color palette and basic structural metaphors but feel free to design a custom layout and add unique elements.`;
            } else {
                adherenceText = `Strictly analyze the attached design's layouts, typography, exact color schemes, visual components, alignment, and spacing. Treat it as a pixel-perfect design reference that must be meticulously translated into functional CSS and clean structural HTML. Replicate its visual essence with extreme precision.`;
            }

            contents.push({
                inlineData: {
                    mimeType: currentSession.attachedFile.mimeType,
                    data: currentSession.attachedFile.base64Data
                }
            });
            contents.push({
                text: `STRICTNESS RULES FOR REFERENCING IMAGE:\n${adherenceText}\n\nFOLLOW THE ATTACHED REFERENCE DESIGN AND MATERIAL STYLE AS A STYLE GUIDE TO DEVELOP THESE CONCEPTUAL VARIATIONS.\n\n${prompt}`
            });
        } else {
            contents.push({ text: prompt });
        }

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
             contents: [{ parts: contents, role: 'user' }],
             config: { temperature: generationTemperature }
        });

        for await (const variation of parseJsonStream(responseStream)) {
            if (variation.name && variation.html) {
                setComponentVariations(prev => [...prev, variation]);
            }
        }
    } catch (e: any) {
        console.error("Error generating variations:", e);
    } finally {
        setIsLoading(false);
    }
  }, [sessions, currentSessionIndex, focusedArtifactIndex, generationTemperature, referenceAdherence, specTypography, specColorScheme, specStructuring, specStyle, specGeneral]);

  const applyVariation = (html: string) => {
      if (focusedArtifactIndex === null) return;
      setSessions(prev => prev.map((sess, i) => 
          i === currentSessionIndex ? {
              ...sess,
              artifacts: sess.artifacts.map((art, j) => 
                j === focusedArtifactIndex ? { ...art, html, status: 'complete' } : art
              )
          } : sess
      ));
      setDrawerState(s => ({ ...s, isOpen: false }));
  };

  const handleShowCode = () => {
      const currentSession = sessions[currentSessionIndex];
      if (currentSession && focusedArtifactIndex !== null) {
          const artifact = currentSession.artifacts[focusedArtifactIndex];
          setDrawerState({ isOpen: true, mode: 'code', title: 'Source Code', data: artifact.html });
      }
  };

  const handleSendMessage = useCallback(async (manualPrompt?: string) => {
    const promptToUse = manualPrompt || inputValue;
    const trimmedInput = promptToUse.trim();
    
    if (!trimmedInput || isLoading) return;
    if (!manualPrompt) setInputValue('');

    setIsLoading(true);
    const baseTime = Date.now();
    const sessionId = generateId();

    const placeholderArtifacts: Artifact[] = Array(3).fill(null).map((_, i) => ({
        id: `${sessionId}_${i}`,
        styleName: 'Designing...',
        html: '',
        status: 'streaming',
    }));

    // Record the current attachedFile (if any) to the session
    const newSession: Session = {
        id: sessionId,
        prompt: trimmedInput,
        timestamp: baseTime,
        artifacts: placeholderArtifacts,
        attachedFile: attachedFile ? {
            name: attachedFile.name,
            mimeType: attachedFile.mimeType,
            base64Data: attachedFile.base64Data
        } : undefined
    };

    // Save attachment context to local variables so we can clear it in the input area
    const currentAttachment = attachedFile;
    setAttachedFile(null);

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionIndex(sessions.length); 
    setFocusedArtifactIndex(null); 

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API_KEY is not configured.");
        const ai = new GoogleGenAI({ apiKey });

        let specsPrompt = '';
        if (specTypography.trim() || specColorScheme.trim() || specStructuring.trim() || specStyle.trim() || specGeneral.trim()) {
            specsPrompt += `\n\n**USER-SPECIFIED STYLE GUIDE AND SPECIFICATIONS:**\n`;
            if (specTypography.trim()) specsPrompt += `- **Typography & Text Guidelines**: ${specTypography.trim()}\n`;
            if (specColorScheme.trim()) specsPrompt += `- **Color Scheme & Palette**: ${specColorScheme.trim()}\n`;
            if (specStructuring.trim()) specsPrompt += `- **Structuring & Layout**: ${specStructuring.trim()}\n`;
            if (specStyle.trim()) specsPrompt += `- **Visual Style & Themes**: ${specStyle.trim()}\n`;
            if (specGeneral.trim()) specsPrompt += `- **General Notes & Behavior**: ${specGeneral.trim()}\n`;
        }

        let adherenceText = '';
        if (currentAttachment) {
            if (referenceAdherence === 'low') {
                adherenceText = `The attached file is only a very loose, abstract inspiration. DO NOT copy its layout or text. Be as creative as possible, focusing on a new layout and style elements while maintaining only a passing spiritual resemblance.`;
            } else if (referenceAdherence === 'medium') {
                adherenceText = `Balance the visual cues from the attached file with original creative ideas. Adopt the color palette and basic structural metaphors but feel free to design a custom layout and add unique elements.`;
            } else {
                adherenceText = `Strictly analyze the attached design's layouts, typography, exact color schemes, visual components, alignment, and spacing. Treat it as a pixel-perfect design reference that must be meticulously translated into functional CSS and clean structural HTML. Replicate its visual essence with extreme precision.`;
            }
        }

        const stylePrompt = `
Generate 3 distinct, highly evocative design directions for: "${trimmedInput}".

**STRICT IP SAFEGUARD:**
Never use artist or brand names. Use physical and material metaphors.

**CREATIVE EXAMPLES (Do not simply copy these, use them as a guide for tone):**
- Example A: "Asymmetrical Rectilinear Blockwork" (Grid-heavy, primary pigments, thick structural strokes, Bauhaus-functionalism vibe).
- Example B: "Grainy Risograph Layering" (Tactile paper texture, overprinted translucent inks, dithered gradients).
- Example C: "Kinetic Wireframe Suspension" (Floating silhouettes, thin balancing lines, organic primary shapes).
- Example D: "Spectral Prismatic Diffusion" (Glassmorphism, caustic refraction, soft-focus morphing gradients).

**GOAL:**
Return ONLY a raw JSON array of 3 *NEW*, creative names for these directions (e.g. ["Tactile Risograph Press", "Kinetic Silhouette Balance", "Primary Pigment Gridwork"]).${specsPrompt}
        `.trim();

        const styleParts: any[] = [];
        if (currentAttachment) {
            styleParts.push({
                inlineData: {
                    mimeType: currentAttachment.mimeType,
                    data: currentAttachment.base64Data
                }
            });
            styleParts.push({
                text: `STRICTNESS RULES FOR REFERENCING IMAGE:\n${adherenceText}\n\nANALYZE THE ATTACHED DESIGN REFERENCE AND PROPOSE THREE CREATIVE DIRECTIONS INSPIRED BY ITS VISUAL STYLE AND METAPHOR.\n\n${stylePrompt}`
            });
        } else {
            styleParts.push({ text: stylePrompt });
        }

        const styleResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: styleParts }],
            config: { temperature: generationTemperature }
        });

        let generatedStyles: string[] = [];
        const styleText = styleResponse.text || '[]';
        const jsonMatch = styleText.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
            try {
                generatedStyles = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.warn("Failed to parse styles, using fallbacks");
            }
        }

        if (!generatedStyles || generatedStyles.length < 3) {
            generatedStyles = [
                "Primary Pigment Gridwork",
                "Tactile Risograph Layering",
                "Kinetic Silhouette Balance"
            ];
        }
        
        generatedStyles = generatedStyles.slice(0, 3);

        setSessions(prev => prev.map(s => {
            if (s.id !== sessionId) return s;
            return {
                ...s,
                artifacts: s.artifacts.map((art, i) => ({
                    ...art,
                    styleName: generatedStyles[i]
                }))
            };
        }));

        const generateArtifact = async (artifact: Artifact, styleInstruction: string) => {
            try {
                const prompt = `
You are Flash UI. Create a stunning, high-fidelity UI component for: "${trimmedInput}".

**CONCEPTUAL DIRECTION: ${styleInstruction}**

**VISUAL EXECUTION RULES:**
1. **Materiality**: Use the specified metaphor to drive every CSS choice. (e.g. if Risograph, use \`feTurbulence\` for grain and \`mix-blend-mode: multiply\` for ink layering).
2. **Typography**: Use high-quality web fonts. Pair a bold sans-serif with a refined monospace for data.
3. **Motion**: Include subtle, high-performance CSS/JS animations (hover transitions, entry reveals).
4. **IP SAFEGUARD**: No artist names or trademarks. 
5. **Layout**: Be bold with negative space and hierarchy. Avoid generic cards.

Return ONLY RAW HTML. No markdown fences.${specsPrompt}
          `.trim();
          
                const artifactParts: any[] = [];
                if (currentAttachment) {
                    artifactParts.push({
                        inlineData: {
                            mimeType: currentAttachment.mimeType,
                            data: currentAttachment.base64Data
                        }
                    });
                    artifactParts.push({
                        text: `STRICTNESS RULES FOR REFERENCING IMAGE:\n${adherenceText}\n\nFOLLOW THE ATTACHED REFERENCE DESIGN AND MATERIAL STYLE AS A STRICT STYLE AND DESIGN GUIDE.\n\n${prompt}`
                    });
                } else {
                    artifactParts.push({ text: prompt });
                }

                const responseStream = await ai.models.generateContentStream({
                    model: 'gemini-3-flash-preview',
                    contents: [{ parts: artifactParts, role: "user" }],
                    config: { temperature: generationTemperature }
                });

                let accumulatedHtml = '';
                for await (const chunk of responseStream) {
                    const text = chunk.text;
                    if (typeof text === 'string') {
                        accumulatedHtml += text;
                        setSessions(prev => prev.map(sess => 
                            sess.id === sessionId ? {
                                ...sess,
                                artifacts: sess.artifacts.map(art => 
                                    art.id === artifact.id ? { ...art, html: accumulatedHtml } : art
                                )
                            } : sess
                        ));
                    }
                }
                
                let finalHtml = accumulatedHtml.trim();
                if (finalHtml.startsWith('```html')) finalHtml = finalHtml.substring(7).trimStart();
                if (finalHtml.startsWith('```')) finalHtml = finalHtml.substring(3).trimStart();
                if (finalHtml.endsWith('```')) finalHtml = finalHtml.substring(0, finalHtml.length - 3).trimEnd();

                setSessions(prev => prev.map(sess => 
                    sess.id === sessionId ? {
                        ...sess,
                        artifacts: sess.artifacts.map(art => 
                            art.id === artifact.id ? { ...art, html: finalHtml, status: finalHtml ? 'complete' : 'error' } : art
                        )
                    } : sess
                ));

            } catch (e: any) {
                console.error('Error generating artifact:', e);
                setSessions(prev => prev.map(sess => 
                    sess.id === sessionId ? {
                        ...sess,
                        artifacts: sess.artifacts.map(art => 
                            art.id === artifact.id ? { ...art, html: `<div style="color: #ff6b6b; padding: 20px;">Error: ${e.message}</div>`, status: 'error' } : art
                        )
                    } : sess
                ));
            }
        };

        await Promise.all(placeholderArtifacts.map((art, i) => generateArtifact(art, generatedStyles[i])));

    } catch (e) {
        console.error("Fatal error in generation process", e);
    } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputValue, isLoading, sessions.length, attachedFile, generationTemperature, referenceAdherence, specTypography, specColorScheme, specStructuring, specStyle, specGeneral]);

  const handleSurpriseMe = () => {
      const currentPrompt = placeholders[placeholderIndex];
      setInputValue(currentPrompt);
      handleSendMessage(currentPrompt);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === 'Tab' && !inputValue && !isLoading) {
        event.preventDefault();
        setInputValue(placeholders[placeholderIndex]);
    }
  };

  const nextItem = useCallback(() => {
      if (focusedArtifactIndex !== null) {
          if (focusedArtifactIndex < 2) setFocusedArtifactIndex(focusedArtifactIndex + 1);
      } else {
          if (currentSessionIndex < sessions.length - 1) setCurrentSessionIndex(currentSessionIndex + 1);
      }
  }, [currentSessionIndex, sessions.length, focusedArtifactIndex]);

  const prevItem = useCallback(() => {
      if (focusedArtifactIndex !== null) {
          if (focusedArtifactIndex > 0) setFocusedArtifactIndex(focusedArtifactIndex - 1);
      } else {
           if (currentSessionIndex > 0) setCurrentSessionIndex(currentSessionIndex - 1);
      }
  }, [currentSessionIndex, focusedArtifactIndex]);

  const isLoadingDrawer = isLoading && drawerState.mode === 'variations' && componentVariations.length === 0;

  const hasStarted = sessions.length > 0 || isLoading;
  const currentSession = sessions[currentSessionIndex];

  let canGoBack = false;
  let canGoForward = false;

  if (hasStarted) {
      if (focusedArtifactIndex !== null) {
          canGoBack = focusedArtifactIndex > 0;
          canGoForward = focusedArtifactIndex < (currentSession?.artifacts.length || 0) - 1;
      } else {
          canGoBack = currentSessionIndex > 0;
          canGoForward = currentSessionIndex < sessions.length - 1;
      }
  }

  return (
    <>
        <button 
            className="history-toggle-btn" 
            onClick={() => setIsHistoryDrawerOpen(true)}
            title="Open Recent Designs"
        >
            <HistoryIcon />
            <span>Recent</span>
        </button>

        <a href="https://x.com/ammaar" target="_blank" rel="noreferrer" className={`creator-credit ${hasStarted ? 'hide-on-mobile' : ''}`}>
            created by @ammaar
        </a>

        <SideDrawer 
            isOpen={drawerState.isOpen} 
            onClose={() => setDrawerState(s => ({...s, isOpen: false}))} 
            title={drawerState.title}
        >
            {isLoadingDrawer && (
                 <div className="loading-state">
                     <ThinkingIcon /> 
                     Designing variations...
                 </div>
            )}

            {drawerState.mode === 'code' && (
                 <div className="drawer-code-view">
                     <div className="drawer-actions-row">
                         <button className="drawer-action-btn" onClick={() => handleCopyCode(drawerState.data)}>
                             {copiedText ? <CheckIcon /> : <CopyIcon />}
                             <span>{copiedText ? 'Copied!' : 'Copy Code'}</span>
                         </button>
                         <button className="drawer-action-btn" onClick={() => {
                             const currentSession = sessions[currentSessionIndex];
                             const activeArtifact = currentSession?.artifacts[focusedArtifactIndex!];
                             handleDownloadHtml(drawerState.data, activeArtifact?.styleName || 'component');
                         }}>
                             <DownloadIcon />
                             <span>Download HTML</span>
                         </button>
                         <button className="drawer-action-btn" onClick={() => handleOpenPreview(drawerState.data)}>
                             <ExternalLinkIcon />
                             <span>Open Preview</span>
                         </button>
                     </div>
                     <pre className="code-block"><code>{drawerState.data}</code></pre>
                 </div>
            )}
            
            {drawerState.mode === 'variations' && (
                 <div className="sexy-grid">
                     {componentVariations.map((v, i) => (
                          <div key={i} className="sexy-card" onClick={() => applyVariation(v.html)}>
                              <div className="sexy-preview">
                                  <iframe srcDoc={v.html} title={v.name} sandbox="allow-scripts allow-same-origin" />
                              </div>
                              <div className="sexy-label">{v.name}</div>
                          </div>
                     ))}
                 </div>
            )}
        </SideDrawer>

        <SideDrawer 
            isOpen={isHistoryDrawerOpen} 
            onClose={() => setIsHistoryDrawerOpen(false)} 
            title="Recent Designs"
        >
            <div className="history-list">
                {sessions.length === 0 ? (
                    <div className="history-empty">
                        <HistoryIcon />
                        <p>No recent designs yet.</p>
                        <span>Generate a component or click "Surprise Me" to start your creative timeline.</span>
                    </div>
                ) : (
                    sessions.map((sess, index) => (
                        <div 
                            key={sess.id} 
                            className={`history-item ${index === currentSessionIndex ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentSessionIndex(index);
                                setFocusedArtifactIndex(null);
                                setIsHistoryDrawerOpen(false);
                            }}
                        >
                            <div className="history-item-details">
                                <div className="history-item-title">{sess.prompt}</div>
                                <div className="history-item-meta">
                                    <span>{new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {sess.attachedFile && (
                                        <span className="history-item-attachment-badge" title="Has style reference attachment">
                                            <AttachmentIcon /> Reference
                                        </span>
                                    )}
                                </div>
                                <div className="history-item-styles">
                                    {sess.artifacts.map((art, aIdx) => (
                                        <span key={art.id} className="history-item-style-badge">
                                            {art.styleName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button 
                                className="history-item-delete" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSession(index);
                                }}
                                title="Delete design session"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </SideDrawer>

        <div className="immersive-app">
            <DottedGlowBackground 
                gap={24} 
                radius={1.5} 
                color="rgba(255, 255, 255, 0.02)" 
                glowColor="rgba(255, 255, 255, 0.15)" 
                speedScale={0.5} 
            />

            <div className={`stage-container ${focusedArtifactIndex !== null ? 'mode-focus' : 'mode-split'}`}>
                 <div className={`empty-state ${hasStarted ? 'fade-out' : ''}`}>
                     <div className="empty-content">
                          <h1>Flash UI</h1>
                          <p>Creative UI generation in a flash</p>
                          <button className="surprise-button" onClick={handleSurpriseMe} disabled={isLoading}>
                              <SparklesIcon /> Surprise Me
                          </button>

                          <div className="templates-section">
                              <div className="templates-divider">
                                  <span>OR CHOOSE A DESIGN TEMPLATE</span>
                              </div>
                              <div className="templates-grid">
                                  {PROMPT_TEMPLATES.map((template) => (
                                      <div 
                                          key={template.id} 
                                          className="template-card"
                                          onClick={() => handleSelectTemplate(template)}
                                          title={`Click to load ${template.name} prompt & custom design specs`}
                                      >
                                          <div className="template-card-header">
                                              <span className="template-card-icon">{template.icon}</span>
                                              <span className="template-card-name">{template.name}</span>
                                          </div>
                                          <p className="template-card-prompt">{template.prompt}</p>
                                          <div className="template-card-meta">
                                              <span className="template-card-tag">{template.category}</span>
                                              <span className="template-card-action">Load Specs →</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                     </div>
                 </div>                 {sessions.map((session, sIndex) => {
                    let positionClass = 'hidden';
                    if (sIndex === currentSessionIndex) positionClass = 'active-session';
                    else if (sIndex < currentSessionIndex) positionClass = 'past-session';
                    else if (sIndex > currentSessionIndex) positionClass = 'future-session';
                    
                    return (
                        <div key={session.id} className={`session-group ${positionClass}`}>
                            <div className="artifact-grid" ref={sIndex === currentSessionIndex ? gridScrollRef : null}>
                                {session.artifacts.map((artifact, aIndex) => {
                                    const isFocused = focusedArtifactIndex === aIndex;
                                    
                                    return (
                                        <ArtifactCard 
                                            key={artifact.id}
                                            artifact={artifact}
                                            isFocused={isFocused}
                                            onClick={() => setFocusedArtifactIndex(aIndex)}
                                            onClose={(e) => {
                                                e.stopPropagation();
                                                setFocusedArtifactIndex(null);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            {session.attachedFile && (
                                <button 
                                    className="floating-reference-badge-btn"
                                    onClick={() => setShowReferenceModal(true)}
                                    title="Click to view attached design reference"
                                >
                                    <AttachmentIcon />
                                    <span>View Reference</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

             {canGoBack && (
                <button className="nav-handle left" onClick={prevItem} aria-label="Previous">
                    <ArrowLeftIcon />
                </button>
             )}
             {canGoForward && (
                <button className="nav-handle right" onClick={nextItem} aria-label="Next">
                    <ArrowRightIcon />
                </button>
             )}

            <div className={`action-bar ${focusedArtifactIndex !== null ? 'visible' : ''}`}>
                 <div className="active-prompt-label">
                    {currentSession?.prompt}
                 </div>
                 <div className="action-buttons">
                    <button onClick={() => setFocusedArtifactIndex(null)}>
                        <GridIcon /> Grid View
                    </button>
                    <button onClick={handleGenerateVariations} disabled={isLoading}>
                        <SparklesIcon /> Variations
                    </button>
                    <button onClick={handleShowCode}>
                        <CodeIcon /> Source
                    </button>
                    {currentSession?.attachedFile && (
                        <button onClick={() => setShowReferenceModal(true)} title="View uploaded design reference">
                            <AttachmentIcon /> Reference
                        </button>
                    )}
                    <div className="export-dropdown-wrapper">
                        <button onClick={() => setShowExportDropdown(!showExportDropdown)}>
                            <ExportIcon /> Export
                        </button>
                        {showExportDropdown && (
                            <>
                                <div className="export-dropdown-overlay" onClick={() => setShowExportDropdown(false)} />
                                <div className="export-dropdown-menu">
                                    <button onClick={() => {
                                        const activeArtifact = currentSession?.artifacts[focusedArtifactIndex!];
                                        if (activeArtifact) {
                                            handleCopyCode(activeArtifact.html);
                                            setShowExportDropdown(false);
                                        }
                                    }}>
                                        {copiedText ? <CheckIcon /> : <CopyIcon />}
                                        <span>{copiedText ? 'Copied!' : 'Copy Code'}</span>
                                    </button>
                                    <button onClick={() => {
                                        const activeArtifact = currentSession?.artifacts[focusedArtifactIndex!];
                                        if (activeArtifact) {
                                            handleDownloadHtml(activeArtifact.html, activeArtifact.styleName);
                                            setShowExportDropdown(false);
                                        }
                                    }}>
                                        <DownloadIcon />
                                        <span>Download HTML</span>
                                    </button>
                                    <button onClick={() => {
                                        const activeArtifact = currentSession?.artifacts[focusedArtifactIndex!];
                                        if (activeArtifact) {
                                            handleOpenPreview(activeArtifact.html);
                                            setShowExportDropdown(false);
                                        }
                                    }}>
                                        <ExternalLinkIcon />
                                        <span>Open Preview</span>
                                    </button>
                                    <button onClick={() => {
                                        const activeArtifact = currentSession?.artifacts[focusedArtifactIndex!];
                                        if (activeArtifact) {
                                            handleCaptureScreenshot(activeArtifact.styleName);
                                            setShowExportDropdown(false);
                                        }
                                    }} disabled={isCapturingScreenshot}>
                                        {isCapturingScreenshot ? (
                                            <span className="animate-spin mr-1">⌛</span>
                                        ) : (
                                            <CameraIcon />
                                        )}
                                        <span>{isCapturingScreenshot ? 'Capturing...' : 'Download Screenshot'}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                 </div>
            </div>

            <div className="floating-input-container">
                {showSettings && (
                    <div className="settings-panel">
                        <div className="settings-panel-header">
                            <div className="settings-panel-title">
                                <SlidersIcon />
                                <span>Design Specs & Controls</span>
                            </div>
                            <button className="settings-panel-close" onClick={() => setShowSettings(false)} title="Close settings">
                                &times;
                            </button>
                        </div>
                        <div className="settings-panel-grid">
                            <div className="settings-field">
                                <div className="field-label-row">
                                    <label>Temperature (Creativity)</label>
                                    <span className="settings-val-highlight">{generationTemperature.toFixed(1)}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0.1" 
                                    max="2.0" 
                                    step="0.1" 
                                    value={generationTemperature} 
                                    onChange={(e) => setGenerationTemperature(parseFloat(e.target.value))} 
                                    className="settings-slider"
                                />
                                <div className="settings-slider-labels">
                                    <span>Focused</span>
                                    <span>Balanced</span>
                                    <span>Creative</span>
                                </div>
                            </div>

                            <div className="settings-field">
                                <div className="field-label-row">
                                    <label>Reference Adherence</label>
                                    <span className="settings-val-highlight capitalize">{referenceAdherence}</span>
                                </div>
                                <div className="adherence-tabs">
                                    {['low', 'medium', 'high'].map(level => (
                                        <button 
                                            key={level}
                                            type="button"
                                            className={`adherence-tab ${referenceAdherence === level ? 'active' : ''}`}
                                            onClick={() => setReferenceAdherence(level)}
                                        >
                                            {level === 'low' ? 'Loose' : level === 'medium' ? 'Medium' : 'Strict'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="settings-field">
                                <label>Text & Typography</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Space Grotesk bold, JetBrains Mono"
                                    value={specTypography}
                                    onChange={(e) => setSpecTypography(e.target.value)}
                                    className="settings-input"
                                />
                            </div>

                            <div className="settings-field">
                                <label>Color Scheme</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Deep charcoal dark, hot orange accents"
                                    value={specColorScheme}
                                    onChange={(e) => setSpecColorScheme(e.target.value)}
                                    className="settings-input"
                                />
                            </div>

                            <div className="settings-field">
                                <label>Structuring & Layout</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Compact 3-column dashboard grid"
                                    value={specStructuring}
                                    onChange={(e) => setSpecStructuring(e.target.value)}
                                    className="settings-input"
                                />
                            </div>

                            <div className="settings-field">
                                <label>Style Theme / Vibe</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Minimal glassmorphism, flat brutalism"
                                    value={specStyle}
                                    onChange={(e) => setSpecStyle(e.target.value)}
                                    className="settings-input"
                                />
                            </div>

                            <div className="settings-field full-width">
                                <label>General Custom Specifications</label>
                                <textarea 
                                    placeholder="Add any extra prompt requirements, functional behaviors, animations, or elements here..."
                                    value={specGeneral}
                                    onChange={(e) => setSpecGeneral(e.target.value)}
                                    className="settings-textarea"
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="settings-panel-actions">
                            <button 
                                type="button" 
                                className="settings-reset-btn" 
                                onClick={() => {
                                    setGenerationTemperature(1.2);
                                    setReferenceAdherence('high');
                                    setSpecTypography('');
                                    setSpecColorScheme('');
                                    setSpecStructuring('');
                                    setSpecStyle('');
                                    setSpecGeneral('');
                                }}
                            >
                                Reset to Default
                            </button>
                        </div>
                    </div>
                )}

                {attachedFile && (
                    <div className="attachment-preview-bar">
                        <div className="attachment-preview-chip">
                            {attachedFile.mimeType.startsWith('image/') ? (
                                <img src={attachedFile.previewUrl} alt="Preview" className="attachment-preview-thumb" />
                            ) : (
                                <div className="attachment-preview-thumb video-thumb">
                                    <VideoIcon />
                                </div>
                            )}
                            <span className="attachment-preview-name">{attachedFile.name}</span>
                            <button className="attachment-remove-btn" onClick={handleRemoveAttachment} title="Remove attachment">
                                &times;
                            </button>
                        </div>
                    </div>
                )}
                <div className={`input-wrapper ${isLoading ? 'loading' : ''}`}>
                    {!isLoading && (
                        <div className="input-action-buttons">
                            <button className="attach-button" onClick={handleAttachmentClick} title="Attach design reference (image, gif, video)">
                                <AttachmentIcon />
                            </button>
                            <button className={`settings-button ${showSettings ? 'active' : ''}`} onClick={() => setShowSettings(!showSettings)} title="Customize Design Specs & Generation Settings">
                                <SettingsIcon />
                            </button>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*,video/*,image/gif" 
                        style={{ display: 'none' }} 
                    />

                    {(!inputValue && !isLoading) && (
                        <div className="animated-placeholder" key={placeholderIndex} style={{ left: '110px' }}>
                            <span className="placeholder-text">{placeholders[placeholderIndex]}</span>
                            <span className="tab-hint">Tab</span>
                        </div>
                    )}
                    {!isLoading ? (
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={inputValue} 
                            onChange={handleInputChange} 
                            onKeyDown={handleKeyDown} 
                            disabled={isLoading} 
                            style={{ paddingLeft: '12px' }}
                        />
                    ) : (
                        <div className="input-generating-label">
                            <span className="generating-prompt-text">{currentSession?.prompt}</span>
                            <ThinkingIcon />
                        </div>
                    )}
                    <button className="send-button" onClick={() => handleSendMessage()} disabled={isLoading || !inputValue.trim()}>
                        <ArrowUpIcon />
                    </button>
                </div>
            </div>

            {showReferenceModal && currentSession?.attachedFile && (
                <div className="reference-modal-overlay" onClick={() => setShowReferenceModal(false)}>
                    <div className="reference-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="reference-modal-header">
                            <h3>Design Reference</h3>
                            <button className="reference-modal-close" onClick={() => setShowReferenceModal(false)}>&times;</button>
                        </div>
                        <div className="reference-modal-body">
                            {currentSession.attachedFile.mimeType.startsWith('image/') ? (
                                <img src={`data:${currentSession.attachedFile.mimeType};base64,${currentSession.attachedFile.base64Data}`} alt="Reference" />
                            ) : (
                                <video src={`data:${currentSession.attachedFile.mimeType};base64,${currentSession.attachedFile.base64Data}`} controls />
                            )}
                        </div>
                        <div className="reference-modal-footer">
                            <span>{currentSession.attachedFile.name}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}