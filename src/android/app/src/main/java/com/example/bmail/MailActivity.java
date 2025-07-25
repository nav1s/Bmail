package com.example.bmail;

import android.app.Activity;
import android.os.Bundle;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.ViewModelProvider;
import androidx.lifecycle.ViewModelStoreOwner;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.util.List;

public class MailActivity extends AppCompatActivity {
    private MailViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_mail);

        MailViewModel viewModel = new ViewModelProvider(this).get(MailViewModel.class);

        RecyclerView recyclerView = findViewById(R.id.recycler_view);
        final mailsAdapter adapter = new mailsAdapter(this);
        recyclerView.setAdapter(adapter);

        viewModel.getMails().observe(this, mails -> {
            if (mails != null) {
                adapter.setMails(mails);
            }
        });

    }
    }
