#include "app/App.h"
#include "input/CliReader.h"
#include "Output/CliPrinter.h"

int main() {
    App app;
    CliReader reader;
    CLIPrinter printer;
    app.run(reader, printer);

    return 0;
}
