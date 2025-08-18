package com.example.bmail.Entities;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import com.google.gson.annotations.Expose;

import java.util.List;

@Entity
public class ClientMail {

    @Expose
    private String title;
    @Expose
    private String body;
    @Expose
    private String from;
    @Expose
    private List<String> to;
    @Expose
    private Boolean draft;

    public ClientMail(String subject, String body, String sender, List<String> to, boolean draft) {
        this.title = subject;
        this.body = body;
        this.from = sender;
        this.to = to;
        this.draft = draft;
    }

    public Boolean getDraft() {
        return draft;
    }

    public void setDraft(Boolean draft) {
        this.draft = draft;
    }

    public List<String> getTo() {
        return to;
    }

    public void setTo(List<String> to) {
        this.to = to;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

}
