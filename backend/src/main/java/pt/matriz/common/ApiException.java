package pt.matriz.common;

public class ApiException extends RuntimeException {
    private final int status;
    private final String field;

    public ApiException(int status, String message) {
        this(status, message, null);
    }

    public ApiException(int status, String message, String field) {
        super(message);
        this.status = status;
        this.field = field;
    }

    public int status() { return status; }
    public String field() { return field; }

    public static ApiException notFound() {
        return new ApiException(404, "O recurso não está disponível.");
    }
}
