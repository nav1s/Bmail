package com.example.bmail.Utils;

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;

public class ImageUtils {
    private static final String TAG = "ImageUtils";

    /**
     * Creates a MultipartBody.Part for the image file.
     * @param context Application context
     * @param imageUri The URI of the image file as string
     * @param paramName The form parameter name for the image
     * @return A MultipartBody.Part containing the image data, or null if the imageUri is empty or invalid.
     */
    public static MultipartBody.Part createImagePart(Context context, String imageUri, String paramName) {
        if (imageUri != null && !imageUri.isEmpty()) {
            try {
                Uri uri = Uri.parse(imageUri);
                byte[] imageBytes = getBytesFromUri(context, uri);
                if (imageBytes != null) {
                    RequestBody imageBody = RequestBody.create(imageBytes, MediaType.parse("image/*"));
                    return MultipartBody.Part.createFormData(paramName, "image.jpg", imageBody);
                }
            } catch (IOException e) {
                Log.e(TAG, "Error reading image file", e);
            }
        }
        return null;
    }

    /**
     * Reads bytes from a URI and returns them as a byte array.
     * @param context Application context
     * @param uri The URI to read from.
     * @return A byte array containing the data from the URI, or null if an error occurs.
     * @throws IOException If an error occurs while reading from the URI.
     */
    @Nullable
    private static byte[] getBytesFromUri(@NonNull Context context, Uri uri) throws IOException {
        ContentResolver contentResolver = context.getContentResolver();
        try (InputStream inputStream = contentResolver.openInputStream(uri)) {
            if (inputStream == null) return null;

            ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
            int bufferSize = 1024;
            byte[] buffer = new byte[bufferSize];
            int len;
            while ((len = inputStream.read(buffer)) != -1) {
                byteBuffer.write(buffer, 0, len);
            }
            return byteBuffer.toByteArray();
        }
    }
}