from flask import Flask, request, jsonify

app = Flask(__name__)

LOG_FILE = "urls.log"

@app.route('/capture-har', methods=['POST'])
def capture_har():
    try:
        data = request.get_json()

        # Debugging: Print received data
        print("Received Data:", data)

        if not data:
            return jsonify({"status": "error", "message": "No data received"}), 400
        
        # Ensure required fields exist
        if "pageUrl" not in data or "request" not in data or "url" not in data["request"]:
            return jsonify({"status": "error", "message": "Invalid data format"}), 400

        page_url = data["pageUrl"]  # Origin page where request was made
        request_url = data["request"]["url"]  # Actual network request URL

        # Save data in log file
        with open(LOG_FILE, "a") as file:
            file.write(f"{page_url} {request_url}\n")

        print("Captured HAR Data Successfully")
        return jsonify({"status": "success"}), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3000)