#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod tray;
fn main() {
    tauri::Builder::default()
        .system_tray(tray::main_menu())
        .on_system_tray_event(tray::handler)
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
