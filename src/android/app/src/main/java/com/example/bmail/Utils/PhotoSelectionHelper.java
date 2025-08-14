package com.example.bmail.Utils;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class PhotoSelectionHelper {

    public static final int REQUEST_CAMERA_PERMISSION = 100;

    private String profileImagePath = null;
    private final ActivityResultLauncher<Intent> galleryLauncher;
    private final ActivityResultLauncher<Intent> cameraLauncher;
    private final AppCompatActivity activity;
    private Uri cameraImageUri = null;

    public interface Callback {
        void onPhotoSelected(String imagePath, Uri imageUri);
    }

    public PhotoSelectionHelper(@NonNull AppCompatActivity activity, Callback callback) {
        this.activity = activity;

        // Gallery launcher
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

        // Camera launcher
        cameraLauncher = activity.registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK) {
                        Log.d("PhotoSelectionHelper", "Camera Image URI: " + cameraImageUri);
                        if (cameraImageUri != null) {
                            profileImagePath = cameraImageUri.toString();
                            callback.onPhotoSelected(profileImagePath, cameraImageUri);
                        } else {
                            Log.e("PhotoSelectionHelper", "Camera image URI is null");
                            profileImagePath = null;
                            callback.onPhotoSelected(null, null);
                        }
                    }
                });
    }

    /**
     * @brief Shows a dialog to choose between camera and gallery.
     */
    public void showPhotoSelectionOptions() {
        String[] options = {"Take photo", "Choose from gallery"};

        new AlertDialog.Builder(activity)
                .setTitle("Select photo")
                .setItems(options, (dialog, which) -> {
                    if (which == 0) {
                        // Take photo with camera
                        takePhotoWithCamera();
                    } else {
                        // Choose from gallery
                        selectPhotoFromGallery();
                    }
                })
                .setNegativeButton("Cancel", (dialog, which) -> dialog.dismiss())
                .show();
    }

    /**
     * @brief launches the gallery to select a photo.
     */
    public void selectPhotoFromGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK);
        intent.setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*");
        galleryLauncher.launch(intent);
    }

    /**
     * @brief launches the camera to take a photo.
     * Checks for camera permission before launching the camera.
     */
    public void takePhotoWithCamera() {
        // Check if camera permission is granted
        if (ContextCompat.checkSelfPermission(activity, android.Manifest.permission.CAMERA)
                != PackageManager.PERMISSION_GRANTED) {
            // Request the permission
            ActivityCompat.requestPermissions(activity,
                    new String[]{android.Manifest.permission.CAMERA},
                    REQUEST_CAMERA_PERMISSION);
            return;
        }

        // Permission already granted, launch camera directly
        launchCamera();
    }

    /**
     * @brief launches the camera to take a photo.
     * This method is called after permission is granted.
     */
    public void launchCamera() {
        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        Log.d("PhotoSelectionHelper", "Attempting to launch camera");

        // Ensure that there's a camera activity to handle the intent
        if (takePictureIntent.resolveActivity(activity.getPackageManager()) == null) {
            Log.e("PhotoSelectionHelper", "No camera app available to handle the intent");
            return;
        }

        // Create the File where the photo should go
        File photoFile = null;
        try {
            photoFile = createImageFile();
        } catch (IOException ex) {
            Log.e("PhotoSelectionHelper", "Error creating image file", ex);
        }

        // Continue only if the File was successfully created
        if (photoFile == null) {
            Log.e("PhotoSelectionHelper", "Failed to create image file");
            return;
        }

        cameraImageUri = FileProvider.getUriForFile(
                activity,
                "com.example.bmail.fileprovider",
                photoFile);
        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri);

        Log.d("PhotoSelectionHelper", "Launching camera with URI: " + cameraImageUri);
        cameraLauncher.launch(takePictureIntent);
    }


    /**
     * @return The created file
     * @throws IOException if file creation fails
     * @brief Creates an image file with a unique name.
     */
    @NonNull
    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = activity.getExternalFilesDir(android.os.Environment.DIRECTORY_PICTURES);
        File image = File.createTempFile(
                imageFileName,
                ".jpg",
                storageDir
        );

        profileImagePath = image.getAbsolutePath();
        return image;
    }
}