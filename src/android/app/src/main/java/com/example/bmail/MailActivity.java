package com.example.bmail;

import android.app.Activity;
import android.os.Bundle;

import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

public class MailActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail);

        // Initialize the MailViewModel
        MailViewModel mailViewModel = new MailViewModel(new MailRepository(this));

        // Load the user's emails
        mailViewModel.loadEmails();

        RecyclerView recyclerView = findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(new EmailAdapter(mailViewModel.getEmails()));

    }
    }
