package com.example.bmail.Utils;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

public class PhotoSelectionHelper {

    private String profileImagePath = null;
    private final ActivityResultLauncher<Intent> galleryLauncher;

    public interface Callback {
        void onPhotoSelected(String imagePath, Uri imageUri);
    }

    public PhotoSelectionHelper(@NonNull AppCompatActivity activity, Callback callback) {
        galleryLauncher = activity.registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                        Uri selectedImageUri = result.getData().getData();
                        Log.d("PhotoSelectionHelper", "Selected Image URI: " + selectedImageUri);
                        if (selectedImageUri != null) {
                            profileImagePath = selectedImageUri.toString();
                            callback.onPhotoSelected(profileImagePath, selectedImageUri);
                        } else {
                            Log.e("PhotoSelectionHelper", "Selected image URI is null");
                            profileImagePath = null;
                            callback.onPhotoSelected(null, null);
                        }
                    }
                });
    }

    /**
     * @brief launches the gallery to select a photo.
     */
    public void selectPhotoFromGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK);
        intent.setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*");
        galleryLauncher.launch(intent);
    }
}