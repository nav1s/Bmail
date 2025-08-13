package com.example.bmail.Repositories;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Api.LabelApi;
import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.CreateLabelRequest;

import java.util.LinkedList;
import java.util.List;

public class LabelRepository {

    private final LabelApi labelApi;
    private final LabelListData labelListData;

    class LabelListData extends MutableLiveData<List<Label>> {
        public LabelListData() {
            super();
            List<Label> labels = new LinkedList<>();
            setValue(labels);
        }

        @Override
        protected void onActive() {
            super.onActive();
            Log.d("LabelListData", "LabelListData is now active");
            labelApi.loadLabels();
        }
    }

    public LabelRepository(@NonNull Context context) {
        labelListData = new LabelListData();
        labelApi = new LabelApi(labelListData, context);
    }

    public LiveData<List<Label>> getLabels() {
        return labelListData;
    }

    public void loadLabels() {
        labelApi.loadLabels();
    }

    public void createLabel(String name, retrofit2.Callback<Void> callback) {
        CreateLabelRequest labelRequest = new CreateLabelRequest(name);
        labelApi.createLabel(labelRequest, callback);
    }

    public void deleteLabel(String labelId, retrofit2.Callback<Void> callback) {
        labelApi.deleteLabel(labelId, callback);
    }

}
