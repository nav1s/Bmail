package com.example.bmail.Repositories;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Api.LabelApi;
import com.example.bmail.Entities.Label;

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
            labelApi.getLabels();
        }
    }

    public LabelRepository(@NonNull Context context) {
        labelListData = new LabelListData();
        labelApi = new LabelApi(labelListData, context);
    }

    public LiveData<List<Label>> getLabels() {
        return labelListData;
    }

}
