package com.example.bmail;

import java.util.List;

public class MailViewModel {
    private final MailRepository mailRepository;
    private List<String> emails;

    public MailViewModel(MailRepository mailRepository) {
        this.mailRepository = mailRepository;
    }

    public void loadEmails() {
        emails = mailRepository.getEmails();
    }

    public List<String> getEmails() {
        return emails;
    }
}

