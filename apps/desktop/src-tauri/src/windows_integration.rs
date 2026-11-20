use std::path::Path;

pub const SOCIAL_STREAM_OFFICIAL_URL: &str = "https://socialstream.ninja/";
pub const WINDOWS_RUN_KEY_PATH: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
pub const WINDOWS_RUN_VALUE_NAME: &str = "ToranjaOverlay";

pub fn is_obs_executable_name(exe_name: &str) -> bool {
    matches!(
        exe_name.trim().to_ascii_lowercase().as_str(),
        "obs64.exe" | "obs32.exe" | "obs.exe"
    )
}

pub fn format_startup_command(exe_path: &Path) -> String {
    format!("\"{}\" --background", exe_path.display())
}

#[cfg(windows)]
pub fn is_obs_process_running() -> bool {
    use std::mem::{size_of, zeroed};
    use windows_sys::Win32::Foundation::{CloseHandle, INVALID_HANDLE_VALUE};
    use windows_sys::Win32::System::Diagnostics::ToolHelp::{
        CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W,
        TH32CS_SNAPPROCESS,
    };

    unsafe {
        let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
        if snapshot == INVALID_HANDLE_VALUE {
            return false;
        }

        let mut entry: PROCESSENTRY32W = zeroed();
        entry.dwSize = size_of::<PROCESSENTRY32W>() as u32;

        let mut found = false;
        if Process32FirstW(snapshot, &mut entry) != 0 {
            loop {
                let len = entry
                    .szExeFile
                    .iter()
                    .position(|&ch| ch == 0)
                    .unwrap_or(entry.szExeFile.len());
                let name = String::from_utf16_lossy(&entry.szExeFile[..len]);
                if is_obs_executable_name(&name) {
                    found = true;
                    break;
                }

                if Process32NextW(snapshot, &mut entry) == 0 {
                    break;
                }
            }
        }

        CloseHandle(snapshot);
        found
    }
}

#[cfg(not(windows))]
pub fn is_obs_process_running() -> bool {
    false
}

#[cfg(windows)]
pub fn is_windows_startup_enabled() -> bool {
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let Ok(key) = hkcu.open_subkey(WINDOWS_RUN_KEY_PATH) else {
        return false;
    };
    key.get_value::<String, _>(WINDOWS_RUN_VALUE_NAME).is_ok()
}

#[cfg(not(windows))]
pub fn is_windows_startup_enabled() -> bool {
    false
}

#[cfg(windows)]
pub fn sync_windows_startup(enabled: bool) -> Result<(), String> {
    use std::io::ErrorKind;
    use winreg::enums::{HKEY_CURRENT_USER, KEY_SET_VALUE};
    use winreg::RegKey;

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    if enabled {
        let exe_path = std::env::current_exe()
            .map_err(|e| format!("Não foi possível obter o caminho do executável: {e}"))?;
        let command = format_startup_command(&exe_path);
        let (key, _) = hkcu
            .create_subkey(WINDOWS_RUN_KEY_PATH)
            .map_err(|e| format!("Não foi possível abrir a chave de inicialização do Windows: {e}"))?;
        key.set_value(WINDOWS_RUN_VALUE_NAME, &command)
            .map_err(|e| format!("Não foi possível gravar a inicialização com o Windows: {e}"))?;
    } else {
        match hkcu.open_subkey_with_flags(WINDOWS_RUN_KEY_PATH, KEY_SET_VALUE) {
            Ok(key) => {
                if let Err(err) = key.delete_value(WINDOWS_RUN_VALUE_NAME) {
                    if err.kind() != ErrorKind::NotFound {
                        return Err(format!(
                            "Não foi possível remover a inicialização com o Windows: {err}"
                        ));
                    }
                }
            }
            Err(err) if err.kind() == ErrorKind::NotFound => {}
            Err(err) => {
                return Err(format!(
                    "Não foi possível acessar a chave de inicialização do Windows: {err}"
                ));
            }
        }
    }

    Ok(())
}

#[cfg(not(windows))]
pub fn sync_windows_startup(_enabled: bool) -> Result<(), String> {
    Err("Inicialização automática com o sistema é suportada apenas no Windows.".to_string())
}

#[cfg(windows)]
pub fn open_official_social_stream_website() -> Result<(), String> {
    std::process::Command::new("explorer.exe")
        .arg(SOCIAL_STREAM_OFFICIAL_URL)
        .spawn()
        .map_err(|e| format!("Não foi possível abrir o navegador: {e}"))?;
    Ok(())
}

#[cfg(not(windows))]
pub fn open_official_social_stream_website() -> Result<(), String> {
    Err("Abertura direta de navegador implementada apenas no Windows.".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn recognizes_official_obs_executables_only() {
        assert!(is_obs_executable_name("obs64.exe"));
        assert!(is_obs_executable_name("OBS64.EXE"));
        assert!(is_obs_executable_name(" obs32.exe "));
        assert!(is_obs_executable_name("obs.exe"));

        assert!(!is_obs_executable_name("obs-browser-page.exe"));
        assert!(!is_obs_executable_name("chrome.exe"));
        assert!(!is_obs_executable_name("notepad.exe"));
        assert!(!is_obs_executable_name(""));
    }

    #[test]
    fn formats_startup_command_with_quotes_and_background_flag() {
        let path = PathBuf::from(r"C:\Program Files\Toranja Overlay\toranja-overlay.exe");
        assert_eq!(
            format_startup_command(&path),
            "\"C:\\Program Files\\Toranja Overlay\\toranja-overlay.exe\" --background"
        );
    }
}
