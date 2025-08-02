package com.example.bmail.Entities;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

import com.google.gson.annotations.Expose;

import java.util.List;

@Entity
public class Label {
    @PrimaryKey
    @Expose(serialize = false) // Exclude when sending, include when receiving
    private int id;
    @Expose
    private String name;
    @Expose
    private boolean isDefault;
    @Expose
    private boolean isAttachable;
    @Expose
    private List<Integer> mailIds;

    public Label(){

    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }

    public boolean isAttachable() {
        return isAttachable;
    }

    public void setAttachable(boolean attachable) {
        isAttachable = attachable;
    }

    public List<Integer> getMailIds() {
        return mailIds;
    }

    public void setMailIds(List<Integer> mailIds) {
        this.mailIds = mailIds;
    }
}
