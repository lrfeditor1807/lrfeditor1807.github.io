#include <iostream>
#include <string>

struct NightWindow {
    std::string timezone = "America/Santiago";
    std::string start = "20:00";
    std::string end = "07:15";
};

int main() {
    const NightWindow session;
    std::cout << "Thriller 4K Remaster | " << session.start << "-" << session.end
              << " " << session.timezone << '\n';
    return 0;
}
