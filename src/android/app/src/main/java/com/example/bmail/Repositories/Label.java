package com.example.bmail.Repositories;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

import java.util.List;

@Entity
public class Label {
    @PrimaryKey
    private int id;

    private String name;
    private boolean isDefault;
    private boolean isAttachable;
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
