package com.example.bmail.Activities;

import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.bmail.Repositories.MailRepository;
import com.example.bmail.ViewModels.MailViewModel;
import com.example.bmail.ViewModels.MailViewModelFactory;
import com.example.bmail.R;
import com.example.bmail.Adapters.MailsAdapter;
import com.google.android.material.navigation.NavigationView;

public class MailActivity extends AppCompatActivity {
    private DrawerLayout drawer;

    MailViewModel mailViewModel;
    private String label = "inbox";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        drawer = findViewById(R.id.drawer_layout);
        NavigationView navigationView = findViewById(R.id.nav_view);

        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar,
                R.string.open_drawer, R.string.close_drawer);
        drawer.addDrawerListener(toggle);
        toggle.syncState();

        MailRepository mailRepository = new MailRepository(this);
        MailViewModelFactory factory = new MailViewModelFactory(mailRepository);
        mailViewModel = new ViewModelProvider(this, factory)
                .get(MailViewModel.class);

        RecyclerView recyclerView = findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        final MailsAdapter adapter = new MailsAdapter(this);
        recyclerView.setAdapter(adapter);

        SwipeRefreshLayout refreshLayout = findViewById(R.id.swipe_refresh_layout);
        refreshLayout.setOnRefreshListener(() -> {
            mailViewModel.loadMails(label); // reload mails when user swipes to refresh
            refreshLayout.setRefreshing(true); // show the refreshing animation
        });

        mailViewModel.getMails().observe(this, mails -> {
            if (mails != null) {
                adapter.setMails(mails);
                refreshLayout.setRefreshing(false); // stop the refreshing animation
            }
        });

        // Handle navigation item clicks
        navigationView.setNavigationItemSelectedListener(item -> {
            drawer.closeDrawers(); // close drawer on click
            if (item.getItemId() == R.id.nav_inbox) {
                label = "inbox";
            } else if (item.getItemId() == R.id.nav_drafts) {
                label = "drafts";
            } else if (item.getItemId() == R.id.nav_trash) {
                label = "trash";
            } else if (item.getItemId() == R.id.nav_spam) {
                label = "spam";
            } else if (item.getItemId() == R.id.nav_sent) {
                label = "sent";
            } else if (item.getItemId() == R.id.nav_starred) {
                label = "starred";
            }
            else {
                return false;
            }
            mailViewModel.loadMails(label);
            return true;

        });
    }

    }
