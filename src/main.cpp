#include "app/App.h"
#include "menu/ConsoleMenu.h"
#include "command/AddFilterCommand.h"
#include "command/QueryFilterCommand.h"
#include "filter/BloomFilter.h"

#include <memory>

int main() {
    auto console_menu = std::make_shared<ConsoleMenu>();
    auto bloom_filter = std::make_shared<BloomFilter>();

    App app(bloom_filter, console_menu);
    app.registerCommand(1, std::make_shared<AddFilterCommand>(bloom_filter));
    app.registerCommand(2, std::make_shared<QueryFilterCommand>(bloom_filter));
    app.run();

    return 0;
}

