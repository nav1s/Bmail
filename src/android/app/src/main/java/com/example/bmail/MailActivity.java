package com.example.bmail;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

public class MailActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail);
        setSupportActionBar(findViewById(R.id.toolbar));

        MailViewModel viewModel = new ViewModelProvider(this).get(MailViewModel.class);

        RecyclerView recyclerView = findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        final mailsAdapter adapter = new mailsAdapter(this);
        recyclerView.setAdapter(adapter);

        viewModel.getMails().observe(this, mails -> {
            if (mails != null) {
                adapter.setMails(mails);
            }
        });

    }

    }
