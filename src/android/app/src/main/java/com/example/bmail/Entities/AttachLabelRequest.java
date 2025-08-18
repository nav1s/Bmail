package com.example.bmail.Entities;

import com.google.gson.annotations.Expose;

public class AttachLabelRequest {
    @Expose
    private String labelId;

    public AttachLabelRequest(String labelId) {
        this.labelId = labelId;
    }
}