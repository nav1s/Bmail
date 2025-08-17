package com.example.bmail.Api;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Entities.User;
import com.example.bmail.Repositories.UserRepository.UserData;
import com.example.bmail.R;
import com.example.bmail.Utils.ImageUtils;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class UserApi {

    private final WebServiceApi webServiceApi;
    private final Context context;
    private final UserData userData;
    private final MutableLiveData<Bitmap> userImage;
    private final String TAG = "UserApi";

    public UserApi(@NonNull Context context, UserData userData, MutableLiveData<Bitmap> userImage) {
        this.context = context.getApplicationContext();
        this.userData = userData;
        this.userImage = userImage;
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(context.getString(R.string.api))
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        webServiceApi = retrofit.create(WebServiceApi.class);
    }


    /**
     * @brief Retrieves the authentication token from shared preferences.
     * @return the authentication token, or null if not found
     */
    public String getToken() {
        SharedPreferences prefs = context.getSharedPreferences("user_prefs",
                Context.MODE_PRIVATE);
        return prefs.getString("auth_token", null);
    }

    /**
     * @brief Retrieves the user ID from shared preferences.
     * @return the user ID, or null if not found
     */
    public String getUserId() {
        SharedPreferences prefs = context.getSharedPreferences("user_prefs",
                Context.MODE_PRIVATE);
        return prefs.getString("user_id", null);
    }

    /**
     * @brief Loads the user's details from the server and updates the userData LiveData.
     */
    public void loadUserDetails() {
        String token = getToken();
        String userID = getUserId();

        Call<User> call = webServiceApi.getUserDetails(token, userID);
        call.enqueue(new retrofit2.Callback<>() {
            @Override
            public void onResponse(@NonNull Call<User> call, @NonNull Response<User> response) {
                if (response.isSuccessful() && response.body() != null) {
                    User user = response.body();
                    userData.postValue(user);
                    Log.i(TAG, "User details loaded: " + user);
                    // Handle the loaded user details as needed
                } else {
                    Log.e(TAG, "Failed to load user details: " + response.message());
                }
            }

            @Override
            public void onFailure(@NonNull Call<User> call, @NonNull Throwable t) {
                Log.e(TAG, "Error loading user details", t);
            }
        });
    }

    /**
     * @brief Loads the user's profile image from the server.
     * @param url the URL of the profile image to load
     */
    public void loadImage(String url) {
        String token = getToken();
        Log.d(TAG, "Token: " + token);
        Log.d(TAG, "Image URL: " + url);
        Call<okhttp3.ResponseBody> call = webServiceApi.downloadImage("Bearer " + token, url);
        call.enqueue(new retrofit2.Callback<>() {
            @Override
            public void onResponse(
                    @NonNull retrofit2.Call<okhttp3.ResponseBody> call,
                    @NonNull retrofit2.Response<okhttp3.ResponseBody> response) {
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

                try(okhttp3.ResponseBody responseBody = response.body()) {
                    if (responseBody == null) {
                        Log.e(TAG, "Response body is null.");
                        return;
                    }
                    Bitmap bitmap = BitmapFactory.decodeStream(responseBody.byteStream());
                    if (bitmap != null) {
                        userImage.postValue(bitmap);
                        Log.i(TAG, "Profile image loaded successfully.");
                    } else {
                        Log.e(TAG, "Failed to decode profile image.");
                    }
                }
            }

            @Override
            public void onFailure(@NonNull retrofit2.Call<okhttp3.ResponseBody> call, @NonNull Throwable t) {
                Log.e("MainActivity", "Error loading profile image", t);
            }
        });

    }

    /**
     * @brief Updates the user's profile with the provided details.
     * @param firstName the first name of the user
     * @param lastName the last name of the user
     * @param imageUri the URI of the profile image to upload
     */
    public void updateProfile(RequestBody firstName, RequestBody lastName, String imageUri) {
        String token = getToken();

        if (token == null) {
            Log.e("UserApi", "No authentication token found");
            return;
        }
        Log.i(TAG, "Updating profile with token: " + token);
        Log.i(TAG, "First Name: " + firstName);
        Log.i(TAG, "Last Name: " + lastName);

        // Create MultipartBody.Part for the image
        MultipartBody.Part imagePart = imageUri == null ? null:
                ImageUtils.createImagePart(context, imageUri, "image");

        Call <Void> call = webServiceApi.updateProfile("Bearer " + token, firstName,
                lastName, imagePart);

        call.enqueue(new retrofit2.Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call, @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.i(TAG, "Profile updated successfully");
                    loadUserDetails();
                } else {
                    try(okhttp3.ResponseBody errorBody = response.errorBody()) {
                        Log.e(TAG, "Failed to update profile. Code: " + response.code() +
                                ", Message: " + response.message() + ", Error: " + errorBody);
                    } catch (Exception e) {
                        Log.e(TAG, "Failed to update profile: " + response.message(), e);
                    }
                }
            }
            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Log.e(TAG, "Network error updating profile", t);
            }
        });
    }

}
