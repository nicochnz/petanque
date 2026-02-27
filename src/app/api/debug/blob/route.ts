import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

/**
 * Route de diagnostic pour vérifier si Vercel Blob fonctionne.
 * GET : vérifie la config + fait un upload test.
 * À supprimer en production si souhaité.
 */
export async function GET() {
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  const isVercel = !!process.env.VERCEL;

  if (!hasToken) {
    return NextResponse.json({
      blobConfigured: false,
      isVercel,
      testUpload: null,
      hint: 'BLOB_READ_WRITE_TOKEN absent.',
    });
  }

  // Test réel : upload d'un fichier minimal
  let testUpload: { success: boolean; url?: string; error?: string } | null = null;
  try {
    const pathname = `debug/test-${Date.now()}.txt`;
    const blob = await put(pathname, 'test connexion Blob', {
      access: 'public',
      contentType: 'text/plain',
    });
    testUpload = { success: true, url: blob.url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    testUpload = { success: false, error: msg };
  }

  return NextResponse.json({
    blobConfigured: true,
    isVercel,
    testUpload,
    hint: testUpload?.success
      ? `Upload test OK. Ouvre ${testUpload.url} dans un navigateur pour vérifier.`
      : testUpload?.error ?? '',
  });
}
