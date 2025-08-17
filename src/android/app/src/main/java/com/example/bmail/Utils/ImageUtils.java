package com.example.bmail.Utils;

import android.content.ContentResolver;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.example.bmail.Api.WebServiceApi;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Response;

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


    /**
     * Downloads an image from a given URL using the provided WebServiceApi and token.
     * @param webServiceApi The WebServiceApi instance to use for the request.
     * @param token The authentication token to include in the request header.
     * @param url The URL of the image to download.
     * @param callback The callback to handle the success or failure of the image download.
     */
   public static void downloadImage(
           @NonNull WebServiceApi webServiceApi,
           String token,
           String url,
           ImageDownloadCallback callback
   ) {

       Call<ResponseBody> call = webServiceApi.downloadImage("Bearer " + token, url);
       call.enqueue(new retrofit2.Callback<>() {
           @Override
           public void onResponse(@NonNull Call<okhttp3.ResponseBody> call, @NonNull Response<okhttp3.ResponseBody> response) {
               if (!response.isSuccessful()) {
                   Log.e(TAG, "Failed to load profile image: " + response.message());
                   Log.e(TAG, "Response code: " + response.code());

                   try (okhttp3.ResponseBody errorBody = response.errorBody()) {
                       if (errorBody != null) {
                           Log.e(TAG, "Error body: " + errorBody.string());
                       } else {
                           Log.e(TAG, "No error body available.");
                       }
                   } catch (Exception e) {
                       Log.e(TAG, "Error reading error body", e);
                   }
                   return;
               }

               try (okhttp3.ResponseBody responseBody = response.body()) {
                   if (responseBody == null) {
                       Log.e(TAG, "Response body is null.");
                       return;
                   }

                   Bitmap bitmap = BitmapFactory.decodeStream(responseBody.byteStream());
                   if (bitmap != null) {
                       callback.onSuccess(bitmap);
                   } else {
                       callback.onFailure(new Exception("Failed to decode image"));
                   }
               } catch (Exception e) {
                   callback.onFailure(e);
               }
           }


           @Override
           public void onFailure(@NonNull Call<okhttp3.ResponseBody> call, @NonNull Throwable t) {
               callback.onFailure(t);
           }
       });
   }

   public interface ImageDownloadCallback {
       void onSuccess(Bitmap bitmap);
       void onFailure(Throwable t);
   }
}