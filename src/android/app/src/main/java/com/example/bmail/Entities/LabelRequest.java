package com.example.bmail.Entities;

import com.google.gson.annotations.Expose;

public class LabelRequest {
    @Expose
    private String name;

    public LabelRequest(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
