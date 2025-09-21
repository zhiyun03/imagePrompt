"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import dictionaries from "~/config/dictionaries/zh.json";
import type { Locale } from "~/config/i18n-config";

interface UploadResponse {
  id: string;
  file_name: string;
  bytes: number;
  created_at: number;
}

interface GeneratePromptResponse {
  output: string;
  usage: {
    token_count: number;
    output_count: number;
    input_count: number;
  };
  debugUrl: string;
}

export default function ImageToPromptPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [promptType, setPromptType] = useState<'midjouney' | 'stableDiffusion' | 'flux' | 'normal'>('flux');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dict = dictionaries;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setGeneratedPrompt("");

    // 首先检查本地缓存
    const cachedData = localStorage.getItem(`uploaded_file_${file.name}`);
    if (cachedData) {
      try {
        const cache = JSON.parse(cachedData);
        // 检查缓存是否有效（24小时内）
        const cacheAge = Date.now() - cache.uploadedAt;
        const maxCacheAge = 24 * 60 * 60 * 1000; // 24小时

        if (cacheAge < maxCacheAge && cache.fileSize === file.size) {
          console.log('Using cached file ID:', cache.id);
          setUploadedFileId(cache.id);
          return;
        }
      } catch (error) {
        console.log('Cache parse error, proceeding with upload');
      }
    }

    // 没有缓存或缓存过期，上传图片到扣子
    await uploadFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending upload request...');
      const response = await fetch('/api/coze/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        throw new Error(errorData.error || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      console.log('Upload successful:', data);
      setUploadedFileId(data.id);

      // 缓存到本地存储
      localStorage.setItem(`uploaded_file_${file.name}`, JSON.stringify({
        id: data.id,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: Date.now()
      }));

    } catch (error) {
      console.error('Upload error:', error);
      alert(`上传失败，请重试: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const generatePrompt = async () => {
    if (!uploadedFileId) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/coze/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: uploadedFileId,
          promptType,
          userQuery: '请描述一下这个图片',
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data: GeneratePromptResponse = await response.json();
      setGeneratedPrompt(data.output);
    } catch (error) {
      console.error('Generation error:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedPrompt) {
      try {
        await navigator.clipboard.writeText(generatedPrompt);
        alert('已复制到剪贴板');
      } catch (error) {
        console.error('Copy error:', error);
      }
    }
  };

  const handleGenerate = async () => {
    if (uploadedFileId) {
      await generatePrompt();
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={`/${lang}`}>
                <span className="text-purple-600 text-xl font-bold">ImagePrompt.org</span>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <Link href={`/${lang}/login`}>
                <button className="text-purple-600 border border-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md">
                  Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {dict.image_prompt.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {dict.image_prompt.subtitle}
            </p>
          </div>

          {/* Tool Interface */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              {/* Prompt Type Selection */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">选择提示词类型</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: 'flux', label: 'Flux' },
                    { value: 'midjouney', label: 'Midjourney' },
                    { value: 'stableDiffusion', label: 'Stable Diffusion' },
                    { value: 'normal', label: '通用' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setPromptType(type.value as any)}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        promptType === type.value
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{dict.image_prompt.upload_image}</h2>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-purple-400 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="mx-auto max-h-48 max-w-full object-contain rounded-lg"
                      />
                      <p className="text-sm text-gray-600">
                        {selectedFile?.name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setGeneratedPrompt("");
                          setUploadedFileId(null);
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        重新选择图片
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg text-gray-600">{dict.image_prompt.drop_image_here}</p>
                        <p className="text-sm text-gray-500 mt-2">{dict.image_prompt.png_jpg_gif_up_to_10mb}</p>
                      </div>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md">
                        {dict.image_prompt.choose_file}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Generated Prompt */}
              <div className="border-t pt-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{dict.image_prompt.generated_prompt}</h2>
                <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
                  {generatedPrompt ? (
                    <div className="space-y-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{generatedPrompt}</p>
                      <div className="text-sm text-gray-500">
                        <p>Token 使用: {isGenerating ? '计算中...' : 'N/A'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">
                      {dict.image_prompt.prompt_will_appear_here}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleGenerate}
                  disabled={!uploadedFileId || isGenerating}
                  className={`px-8 py-3 rounded-md transition-all ${
                    !uploadedFileId || isGenerating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl'
                  } text-white font-medium`}
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>生成中...</span>
                    </div>
                  ) : (
                    dict.image_prompt.generate_prompt
                  )}
                </button>
                <button
                  onClick={copyToClipboard}
                  disabled={!generatedPrompt}
                  className={`px-8 py-3 rounded-md transition-all ${
                    !generatedPrompt
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-purple-600 text-purple-600 hover:bg-purple-50 shadow-md hover:shadow-lg'
                  } font-medium`}
                >
                  {dict.image_prompt.copy_to_clipboard}
                </button>
              </div>

              {/* Status Indicator */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                  {isUploading && (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                      <span>正在上传图片...</span>
                    </>
                  )}
                  {uploadedFileId && !isUploading && !isGenerating && (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>图片已就绪，可以生成提示词</span>
                    </>
                  )}
                  {isGenerating && (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      <span>正在生成提示词...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{dict.image_prompt.detailed_analysis}</h3>
              <p className="text-gray-600">{dict.image_prompt.detailed_analysis_desc}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{dict.image_prompt.instant_results}</h3>
              <p className="text-gray-600">{dict.image_prompt.instant_results_desc}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{dict.image_prompt.privacy_first}</h3>
              <p className="text-gray-600">{dict.image_prompt.privacy_first_desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}