package com.example.bmail.Entities;

import androidx.room.Entity;

import java.util.List;

@Entity
public class Mail {
    private String title;
    private String body;
    private String from;
    private List<String> to;

    public Mail(String subject, String body, String sender, List<String> to,
                Boolean draft) {
        this.title = subject;
        this.body = body;
        this.from = sender;
        this.to = to;
        this.draft = draft;
    }

    private Boolean draft;


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
