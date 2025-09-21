import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const cozeApiToken = process.env.COZE_API_TOKEN;
    if (!cozeApiToken) {
      console.error('Coze API token not configured');
      return NextResponse.json(
        { error: 'Coze API token not configured' },
        { status: 500 }
      );
    }

    console.log('Creating form data for Coze API...');

    // 更直接的 FormData 创建方式
    const cozeFormData = new FormData();
    cozeFormData.append('file', file);

    console.log('Sending request to Coze API...');

    const response = await fetch('https://api.coze.cn/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeApiToken}`,
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
      },
      body: cozeFormData,
    });

    console.log('Coze API response status:', response.status);

    const result = await response.json();
    console.log('Coze API response:', result);

    if (result.code !== 0) {
      console.error('Coze API error:', result);
      return NextResponse.json(
        { error: result.msg || 'Failed to upload file to Coze' },
        { status: 500 }
      );
    }

    console.log('Upload successful:', result.data);
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}