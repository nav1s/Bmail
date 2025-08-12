package com.example.bmail.Entities;

import com.google.gson.annotations.Expose;

public class AttachLabelRequest {
    @Expose
    private String labelId;

    public AttachLabelRequest(String labelId) {
        this.labelId = labelId;
    }

    public String getLabelId() {
        return labelId;
    }
    public void setLabelId(String labelId) {
        this.labelId = labelId;
    }
}