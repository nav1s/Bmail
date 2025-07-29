package com.example.bmail.Activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.widget.EditText;
import android.widget.ImageButton;

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
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;

public class MailActivity extends AppCompatActivity {
    private DrawerLayout drawer;
    private SwipeRefreshLayout refreshLayout;
    private MailViewModel mailViewModel;
    private MailsAdapter adapter;
    private NavigationView navigationView;
    private FloatingActionButton fabCompose;
    private ImageButton btnProfile;
    private EditText searchBar;

    private String label = "inbox";


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail);

        initViews();
        setupListeners();

    }

    private void initViews() {
        refreshLayout = findViewById(R.id.swipe_refresh_layout);
        fabCompose = findViewById(R.id.fab_compose);
        drawer = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);
        btnProfile = findViewById(R.id.profile_button);
        searchBar = findViewById(R.id.search_edit_text);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar,
                R.string.open_drawer, R.string.close_drawer);
        drawer.addDrawerListener(toggle);
        toggle.syncState();

        RecyclerView recyclerView = findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new MailsAdapter(this);
        recyclerView.setAdapter(adapter);

    }

    private void setupListeners(){
        MailRepository mailRepository = new MailRepository(this);
        MailViewModelFactory factory = new MailViewModelFactory(mailRepository);
        mailViewModel = new ViewModelProvider(this, factory)
                .get(MailViewModel.class);

        fabCompose.setOnClickListener(v -> {
            Intent intent = new Intent(MailActivity.this, ComposeActivity.class);
            startActivity(intent);
        });

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
        btnProfile.setOnClickListener(v -> {
            Intent intent = new Intent(MailActivity.this, ProfileActivity.class);
            startActivity(intent);
        });

        // Setup search bar text change listener
        searchBar.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
                // Called before the text is changed
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                // Called when the text is being changed
                String searchText = s.toString().trim();
                if (searchText.isEmpty()) {
                    Log.i("MailActivity", "Search text is empty, loading all mails.");
                } else {
                    Log.i("MailActivity", "Searching for mails with text: " + searchText);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {
                // Called after the text has been changed
            }
        });

    }

}
