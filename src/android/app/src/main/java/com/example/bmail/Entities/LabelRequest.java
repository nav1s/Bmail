package com.example.bmail.Entities;

public class LabelRequest {

    private String labelId;

    public LabelRequest(){

    }
    public LabelRequest(String labelId) {
        this.labelId = labelId;
    }

    public String getLabelId() {
        return labelId;
    }

    public void setLabelId(String labelId) {
        this.labelId = labelId;
    }
}
