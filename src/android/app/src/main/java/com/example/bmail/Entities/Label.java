package com.example.bmail.Entities;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import com.google.gson.annotations.Expose;

import java.util.List;

@Entity
public class Label {

    @PrimaryKey
    @Expose(serialize = false) // Exclude when sending, include when receiving
    private String id;
    @Expose
    private String name;
    @Expose
    private boolean isDefault;
    @Expose
    private boolean isAttachable;
    @Expose
    private List<String> mailIds;

    public Label(){

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
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

    public List<String> getMailIds() {
        return mailIds;
    }

    public void setMailIds(List<String> mailIds) {
        this.mailIds = mailIds;
    }

    @NonNull
    @Override
    public String toString() {
        return "Label{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", isDefault=" + isDefault +
                ", isAttachable=" + isAttachable +
                ", mailIds=" + mailIds +
                '}';
    }
}
