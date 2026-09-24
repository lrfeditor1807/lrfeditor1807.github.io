import java.time.ZoneId;
import java.time.ZonedDateTime;

public final class NightWindow {
    private static final ZoneId ZONE = ZoneId.of("America/Santiago");

    public static void main(String[] args) {
        ZonedDateTime now = ZonedDateTime.now(ZONE);
        System.out.printf("Thriller 4K Remaster — %s%n", now);
    }
}
