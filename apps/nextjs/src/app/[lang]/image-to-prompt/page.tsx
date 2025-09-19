import Link from "next/link";
import { getDictionary } from "~/lib/get-dictionary";
import type { Locale } from "~/config/i18n-config";

export default async function ImageToPromptPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
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
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{dict.image_prompt.upload_image}</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
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
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{dict.image_prompt.generated_prompt}</h2>
                <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
                  <p className="text-gray-500 text-center">
                    {dict.image_prompt.prompt_will_appear_here}
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-md">
                  {dict.image_prompt.generate_prompt}
                </button>
                <button className="bg-white border border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-md">
                  {dict.image_prompt.copy_to_clipboard}
                </button>
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