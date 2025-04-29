#include "app/App.h"
#include "input/CliReader.h"
#include "output/CliPrinter.h"

int main() {
    App app;
    CliReader reader;
    CLIPrinter printer;
    app.run(reader, printer);

    return 0;
}
