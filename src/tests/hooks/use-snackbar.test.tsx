/**
 * Unit tests for useSnackbar hook (context-based; requires SnackbarProvider).
 */

import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useSnackbar, SnackbarProvider } from "@/hooks/use-snackbar";

function wrapper({ children }: { children: React.ReactNode }) {
  return <SnackbarProvider>{children}</SnackbarProvider>;
}

describe("useSnackbar Hook", () => {
  it("initializes with null message", () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper });
    expect(result.current.message).toBeNull();
  });

  it("shows message when showMessage is called", () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showMessage("Test message", "success");
    });

    expect(result.current.message).toEqual({
      text: "Test message",
      type: "success",
    });
  });

  it("supports different message types", () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper });
    const types: Array<"success" | "error" | "info" | "warning"> = [
      "success",
      "error",
      "info",
      "warning",
    ];

    types.forEach((type) => {
      act(() => {
        result.current.showMessage(`Message ${type}`, type);
      });
      expect(result.current.message?.type).toBe(type);
    });
  });

  it("defaults to info when type not specified", () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showMessage("Message without type");
    });

    expect(result.current.message?.type).toBe("info");
  });

  it("hides message when hideMessage is called", () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showMessage("Test message", "success");
    });
    expect(result.current.message).not.toBeNull();

    act(() => {
      result.current.hideMessage();
    });
    expect(result.current.message).toBeNull();
  });

  it("replaces previous message when showMessage is called again", () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showMessage("First message", "info");
    });
    expect(result.current.message?.text).toBe("First message");

    act(() => {
      result.current.showMessage("Second message", "error");
    });
    expect(result.current.message?.text).toBe("Second message");
    expect(result.current.message?.type).toBe("error");
  });
});
