package com.example.bmail.Api;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.CreateLabelRequest;
import com.example.bmail.R;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class LabelApi {
    private static final String TAG = "LabelApi";
    private static final String PREFS_NAME = "user_prefs";
    private static final String TOKEN_KEY = "auth_token";
    private static final String BEARER_PREFIX = "Bearer ";

    private final MutableLiveData<List<Label>> labelListData;
    private final WebServiceApi webServiceApi;
    private final SharedPreferences prefs;

    public LabelApi(MutableLiveData<List<Label>> labelListData, @NonNull Context context) {
        this.labelListData = labelListData;
        Context appContext = context.getApplicationContext();
        this.prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        this.webServiceApi = createWebServiceApi(appContext);
    }

    @NonNull
    private WebServiceApi createWebServiceApi(@NonNull Context context) {
        Gson gson = new GsonBuilder()
                .excludeFieldsWithoutExposeAnnotation()
                .create();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(context.getString(R.string.api))
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build();

        return retrofit.create(WebServiceApi.class);
    }

    private String getToken() {
        return prefs.getString(TOKEN_KEY, null);
    }

    public void loadLabels() {
        String token = getToken();
        Log.i(TAG, "Token: " + token);

        Call<List<Label>> call = webServiceApi.getLabels(BEARER_PREFIX + token);
        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<Label>> call, @NonNull Response<List<Label>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Label> labels = response.body();
                    Log.i(TAG, "Labels loaded successfully: " + labels.size() + " labels found.");
                    labelListData.postValue(labels);
                } else {
                    Log.e(TAG, "Failed to load labels: " + response.message());
                    labelListData.postValue(null);
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Label>> call, @NonNull Throwable t) {
                Log.e(TAG, "Network error: ", t);
                labelListData.postValue(null);
            }
        });
    }


    public void createLabel(CreateLabelRequest labelRequest, retrofit2.Callback<Void> callback) {
        String token = getToken();
        Log.i(TAG, "Creating label with token: " + token);
        Call<Void> call = webServiceApi.createLabel(BEARER_PREFIX + token, labelRequest);
        call.enqueue(callback);
    }

}
