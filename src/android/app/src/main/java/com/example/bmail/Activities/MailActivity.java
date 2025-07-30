package com.example.bmail.Activities;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.Menu;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.bmail.Entities.Mail;
import com.example.bmail.Repositories.MailRepository;
import com.example.bmail.ViewModels.MailViewModel;
import com.example.bmail.ViewModels.MailViewModelFactory;
import com.example.bmail.R;
import com.example.bmail.Adapters.MailsAdapter;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;

public class MailActivity extends AppCompatActivity {
    // Constants for mail labels
    private static final String LABEL_INBOX = "inbox";
    private static final String LABEL_DRAFTS = "drafts";
    private static final String LABEL_TRASH = "trash";
    private static final String LABEL_SPAM = "spam";
    private static final String LABEL_SENT = "sent";
    private static final String LABEL_STARRED = "starred";

    private DrawerLayout drawer;
    private SwipeRefreshLayout refreshLayout;
    private MailViewModel mailViewModel;
    private MailsAdapter adapter;
    private NavigationView navigationView;
    private FloatingActionButton fabCompose;
    private ImageButton btnProfile;
    private EditText searchBar;
    private TextView logout;

    private String label = LABEL_INBOX;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail);

        initViews();
        setupListeners();
    }

    /**
     * @brief Initialize the views for the MailActivity.
     * Finds views by their IDs and sets up the toolbar and RecyclerView.
     */
    private void initViews() {
        refreshLayout = findViewById(R.id.swipe_refresh_layout);
        fabCompose = findViewById(R.id.fab_compose);
        drawer = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);
        btnProfile = findViewById(R.id.profile_button);
        searchBar = findViewById(R.id.search_edit_text);
        logout = findViewById(R.id.nav_logout);

        setupToolbar();
        setupRecyclerView();
    }

    /**
     * @brief Setup the toolbar for the MailActivity.
     * Initializes the toolbar and sets up the ActionBarDrawerToggle for navigation drawer.
     */
    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar,
                R.string.open_drawer, R.string.close_drawer);
        drawer.addDrawerListener(toggle);
        toggle.syncState();
    }

    /**
     * @brief Setup the RecyclerView for displaying mails.
     * Initializes the RecyclerView with a LinearLayoutManager and sets the adapter.
     */
    private void setupRecyclerView() {
        RecyclerView recyclerView = findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new MailsAdapter(this, this::showMailContent);
        recyclerView.setAdapter(adapter);
    }

    /**
     * @brief Setup listeners for the MailActivity.
     * Initializes ViewModel, sets up click listeners, navigation listener,
     * search listener, and custom menu item.
     */
    private void setupListeners() {
        setupViewModel();
        setupClickListeners();
        setupNavigationListener();
        setupSearchListener();
        setupCustomLabels();
    }

    /**
     * @brief Setup the ViewModel for the MailActivity.
     * Initializes the MailViewModel and observes the mails LiveData.
     * Updates the adapter when new mails are received.
     */
    private void setupViewModel() {
        MailRepository mailRepository = new MailRepository(this);
        MailViewModelFactory factory = new MailViewModelFactory(mailRepository);
        mailViewModel = new ViewModelProvider(this, factory).get(MailViewModel.class);

        mailViewModel.getMails().observe(this, mails -> {
            if (mails != null) {
                adapter.setMails(mails);
                refreshLayout.setRefreshing(false);
            }
        });
    }

    /**
     * @brief Setup click listeners for various UI elements.
     * Handles compose button, refresh layout, profile button, and logout button.
     */
    private void setupClickListeners() {
        fabCompose.setOnClickListener(v -> {
            Intent intent = new Intent(this, ComposeActivity.class);
            startActivity(intent);
        });

        refreshLayout.setOnRefreshListener(() -> {
            mailViewModel.loadMails(label);
            refreshLayout.setRefreshing(true);
        });

        btnProfile.setOnClickListener(v -> {
            Intent intent = new Intent(this, ProfileActivity.class);
            startActivity(intent);
        });

        logout.setOnClickListener(v -> showLogoutDialog());
    }

    /**
     * @brief Setup a listener for the navigation drawer.
     * Changes the label based on the selected item and loads mails accordingly.
     */
    private void setupNavigationListener() {
        navigationView.setNavigationItemSelectedListener(item -> {
            drawer.closeDrawers();

            int itemId = item.getItemId();
            if (itemId == R.id.nav_inbox) {
                label = LABEL_INBOX;
            } else if (itemId == R.id.nav_drafts) {
                label = LABEL_DRAFTS;
            } else if (itemId == R.id.nav_trash) {
                label = LABEL_TRASH;
            } else if (itemId == R.id.nav_spam) {
                label = LABEL_SPAM;
            } else if (itemId == R.id.nav_sent) {
                label = LABEL_SENT;
            } else if (itemId == R.id.nav_starred) {
                label = LABEL_STARRED;
            } else {
                return false;
            }

            mailViewModel.loadMails(label);
            return true;
        });
    }

    /**
     * @brief Setup a listener for the search bar.
     * Logs the search text when it changes.
     */
    private void setupSearchListener() {
        searchBar.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                String searchText = s.toString().trim();
                String logMessage = searchText.isEmpty() ?
                    "Search text is empty, loading all mails." :
                    "Searching for mails with text: " + searchText;
                Log.i("MailActivity", logMessage);
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void setupCustomLabels() {
        Menu menu = navigationView.getMenu();
        menu.add(R.id.group_main, Menu.NONE, Menu.NONE, "Custom Item")
                .setIcon(R.drawable.ic_folder)
                .setOnMenuItemClickListener(item -> {
                    Log.i("MailActivity", "Custom item clicked");
                    return true;
                });
        menu.add(R.id.group_main, Menu.NONE, Menu.NONE, "Another Item")
                .setIcon(R.drawable.ic_folder)
                .setOnMenuItemClickListener(item -> {
                    Log.i("MailActivity", "Another item clicked");
                    return true;
                });
    }

    /**
     * @brief Show a dialog to confirm logout.
     * If confirmed, clears user preferences and redirects to the login activity.
     */
    private void showLogoutDialog() {
        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Logout")
                .setMessage("Are you sure you want to logout?")
                .setPositiveButton("Yes", (dialog, which) -> performLogout())
                .setNegativeButton("Cancel", (dialog, which) -> dialog.dismiss())
                .show();
    }

    /**
     * @brief Perform the logout operation.
     * Clears user preferences and redirects to the login activity.
     */
    private void performLogout() {
        SharedPreferences preferences = getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
        preferences.edit().clear().apply();

        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    /**
     * @brief Show the content of the clicked mail.
     * @param view The view that was clicked, containing the mail data.
     */
    private void showMailContent(@NonNull View view) {
        Mail clickedMail = (Mail) view.getTag();
        if (clickedMail == null) {
            Log.w("MailActivity", "Clicked mail is null, cannot show content.");
            return;
        }
        Log.i("MailActivity", "Clicked mail: " + clickedMail.getTitle());
        Intent intent = new Intent(this, MailContentActivity.class);
        intent.putExtra("mail_id", clickedMail.getId());
        startActivity(intent);
    }

}
