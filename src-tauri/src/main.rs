#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::io::{Read, Write};

use quick_xml::events::Event;
use quick_xml::Reader;
use tauri::command;
use zip::{ZipArchive, ZipWriter, write::FileOptions};

#[command]
fn open_docx(path: String) -> Result<String, String> {
    let file = File::open(path).map_err(|e| e.to_string())?;
    let mut archive = ZipArchive::new(file).map_err(|e| e.to_string())?;

    let mut xml = String::new();
    archive
        .by_name("word/document.xml")
        .map_err(|e| e.to_string())?
        .read_to_string(&mut xml)
        .map_err(|e| e.to_string())?;

    Ok(parse_document_xml(&xml))
}

fn parse_document_xml(xml: &str) -> String {
    let mut reader = Reader::from_str(xml);
    reader.trim_text(true);

    let mut text = String::new();

    loop {
        match reader.read_event() {
            Ok(Event::Text(e)) => {
                text.push_str(&e.unescape().unwrap_or_default());
                text.push('\n');
            }
            Ok(Event::Eof) => break,
            _ => {}
        }
    }

    text
}

#[command]
fn save_docx(path: String, content: String) -> Result<(), String> {
    let file = File::create(path).map_err(|e| e.to_string())?;
    let mut zip = ZipWriter::new(file);

    let options = FileOptions::default();

    let document_xml = format!(
        r#"<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
                {}
            </w:body>
        </w:document>"#,
        content
            .lines()
            .map(|line| format!("<w:p><w:r><w:t>{}</w:t></w:r></w:p>", line))
            .collect::<Vec<_>>()
            .join("")
    );

    zip.start_file("word/document.xml", options)
        .map_err(|e| e.to_string())?;
    zip.write_all(document_xml.as_bytes())
        .map_err(|e| e.to_string())?;

    zip.finish().map_err(|e| e.to_string())?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init()) // ✅ required
        .invoke_handler(tauri::generate_handler![open_docx, save_docx])
        .run(tauri::generate_context!())
        .expect("error running tauri app");
}
