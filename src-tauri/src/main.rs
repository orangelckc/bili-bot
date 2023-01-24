#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod tray;
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "macos")] //✅ `macOS`下不显示docker图标
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_sqlite::init())
        .system_tray(tray::main_menu())
        .on_system_tray_event(tray::handler)
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("Tauri程序运行失败");
}
